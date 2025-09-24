import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Website from "@/models/Website";
import { requireAuth } from "@/lib/auth";
import { clerkClient } from "@clerk/nextjs/server";
import AdminRole from "@/models/AdminRole";
import { WebsiteCreateSchema } from "@/utils/types";
import type { Model } from "mongoose";
import type { IUser } from "@/models/User"; // Adjust path if needed

// Helper function to safely count documents
async function safeCountDocuments(filter: any): Promise<number> {
  try {
    const result = await Website.countDocuments(filter).exec();
    return result;
  } catch (error) {
    console.error("Error counting documents:", error);
    return 0;
  }
}

export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;
  const role = searchParams.get("role"); // Get role parameter

  // Build filter object
  let filter: any = {};

  if (status && ["pending", "approved", "rejected"].includes(status)) {
    filter.status = status;
  }

  if (category) {
    // For category search, use regex to match any category that contains the search term
    // Since category is now an array, we need to search within the array
    filter.category = { $regex: category, $options: 'i' };
  }

  const authCheck = await requireAuth();
  const isAuthenticated = !(authCheck instanceof NextResponse);

  try {
    if (owner === "me") {
      if (!isAuthenticated) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      const userId = authCheck as string;
      filter.userId = userId;

      const websites = await Website.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      const total = await safeCountDocuments(filter);

      return NextResponse.json({
        websites,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }

    // Public access → only approved websites
    if (!isAuthenticated) {
      filter.status = "approved";
      filter.available = true; // Only show available websites

      const websites = await Website.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      const total = await safeCountDocuments(filter);

      return NextResponse.json({
        websites,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }

    // Authenticated user role handling
    const userId = authCheck;
    const userRole = await getUserRole(userId);

  // Allow both superadmins and 'websites' analysts to access the full websites view
  if (userRole === "superadmin" || userRole === "websites" || role === "superadmin") {
      // For super admin, populate user email information
      const websites = await Website.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      // Get unique user IDs
      const userIds = [...new Set(websites.map(website => website.userId).filter(id => id))];
      
      // Fetch user emails
      let userEmails: Record<string, string> = {};
      if (userIds.length > 0) {
        const UserModel = (await import("@/models/User")).default as Model<IUser>;
        const users = await UserModel.find({ clerkId: { $in: userIds } });
        userEmails = users.reduce((acc, user) => {
          acc[user.clerkId] = user.email;
          return acc;
        }, {} as Record<string, string>);
      }

      // Add user email to each website
      const websitesWithUserEmail = websites.map(website => {
        const websiteObj: any = website.toJSON();
        // Add userEmail field from user email lookup
        websiteObj.userEmail = userEmails[website.userId] || website.userId || 'Unknown';
        return websiteObj;
      });

      const total = await safeCountDocuments(filter);

      return NextResponse.json({
        websites: websitesWithUserEmail,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
  } else if (userRole === "consumer") {
      filter.status = "approved";
      filter.available = true; // Only show available websites

      const websites = await Website.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      const total = await safeCountDocuments(filter);

      return NextResponse.json({
        websites,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } else if (userRole === "publisher") {
      const orFilter = {
        $or: [
          { userId: userId }, 
          { status: "approved", available: true }
        ],
      };

      const websites = await Website.find(orFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      const total = await safeCountDocuments(orFilter);

      return NextResponse.json({
        websites,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }

    // Default fallback → only approved and available
    filter.status = "approved";
    filter.available = true;
    const websites = await Website.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await safeCountDocuments(filter);

    return NextResponse.json({
      websites,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error in websites API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const userId = authResult as string;

  try {
    const json = await req.json();
  const { title, url, description, priceCents, category, tags, DA, PA, Spam, OrganicTraffic, DR, RD, primaryCountry, primeTrafficCountries, trafficValue, locationTraffic, greyNicheAccepted, specialNotes } = json;

    if (!title || !url || !description || priceCents === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check for existing website with same URL (excluding rejected and priceConflict ones)
    const existingWebsite = await Website.findOne({ 
      url, 
      status: { $in: ['pending', 'approved'] } // Only check active submissions
    });

    console.log('🔍 URL conflict check:', {
      url,
      existingFound: !!existingWebsite,
      existingStatus: existingWebsite?.status,
      existingUserId: existingWebsite?.userId,
      newUserId: userId
    });

    // ✅ Normalize tags into array of strings
    let normalizedTags: string[] = [];
    if (typeof tags === "string") {
      normalizedTags = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);
    } else if (Array.isArray(tags)) {
      normalizedTags = tags.map((tag) => String(tag).trim()).filter((tag) => tag);
    }

    // ✅ Normalize categories into array of strings
    let normalizedCategories: string[] = [];
    if (typeof category === "string") {
      // If it's a comma-separated string, split it
      if (category.includes(",")) {
        normalizedCategories = category
          .split(",")
          .map((cat) => cat.trim())
          .filter((cat) => cat);
      } else {
        // Single category
        normalizedCategories = [category.trim()];
      }
    } else if (Array.isArray(category)) {
      normalizedCategories = category.map((cat) => String(cat).trim()).filter((cat) => cat);
    }

    // ✅ Normalize prime traffic countries into array of strings
    let normalizedPrimeTrafficCountries: string[] = [];
    if (typeof primeTrafficCountries === "string") {
      // If it's a comma-separated string, split it
      if (primeTrafficCountries.includes(",")) {
        normalizedPrimeTrafficCountries = primeTrafficCountries
          .split(",")
          .map((country) => country.trim())
          .filter((country) => country);
      } else {
        // Single country
        normalizedPrimeTrafficCountries = [primeTrafficCountries.trim()];
      }
    } else if (Array.isArray(primeTrafficCountries)) {
      normalizedPrimeTrafficCountries = primeTrafficCountries.map((country) => String(country).trim()).filter((country) => country);
    }

    if (existingWebsite) {
      console.log('🔍 Found existing website:', {
        existingUserId: existingWebsite.userId,
        newUserId: userId,
        sameUser: existingWebsite.userId === userId,
        existingStatus: existingWebsite.status
      });
      
      // Check if it's the same user trying to submit the same URL
      if (existingWebsite.userId === userId) {
        console.log('❌ Same user attempting duplicate submission');
        return NextResponse.json({
          error: "This URL has already been published by you. You cannot submit the same URL twice."
        }, { status: 400 });
      }
      
      console.log('⚔️ Different users - creating price conflict');
      // Different user - create price conflict
      // Create new website first
      const newSite = await Website.create({
        title,
        url,
        description,
        priceCents: Number(priceCents),
        price: Number(priceCents) / 100,
        category: normalizedCategories, // Use normalized categories
        tags: normalizedTags,
        primaryCountry: primaryCountry || undefined, // Add primaryCountry field
        primeTrafficCountries: normalizedPrimeTrafficCountries, // Add prime traffic countries field
        DA: DA ? Number(DA) : undefined,
        PA: PA ? Number(PA) : undefined,
        Spam: Spam ? Number(Spam) : undefined,
        OrganicTraffic: OrganicTraffic ? Number(OrganicTraffic) : undefined,
        DR: DR ? Number(DR) : undefined,
        RD: RD || undefined,
        trafficValue: trafficValue ? Number(trafficValue) : undefined,
        locationTraffic: locationTraffic ? Number(locationTraffic) : undefined,
  greyNicheAccepted: typeof greyNicheAccepted === 'string' ? (greyNicheAccepted === 'true') : (typeof greyNicheAccepted === 'boolean' ? greyNicheAccepted : undefined),
        specialNotes: specialNotes || undefined,
        userId: userId,
        image: "/default-website-image.png",
        status: "pending", // Will be changed to priceConflict
      });

      console.log('✅ New website created:', { id: newSite._id, status: newSite.status });
      
      try {
        // Create price conflict between existing and new website
        await newSite.createPriceConflict(existingWebsite);
        console.log('✅ Price conflict created successfully');
        
        // Reload the updated website to get the new status
        const updatedNewSite = await Website.findById(newSite._id);
        const updatedExistingSite = await Website.findById(existingWebsite._id);
        
        console.log('🔄 After conflict creation:', {
          newSite: { id: updatedNewSite?._id, status: updatedNewSite?.status, conflictGroup: updatedNewSite?.conflictGroup },
          existingSite: { id: updatedExistingSite?._id, status: updatedExistingSite?.status, conflictGroup: updatedExistingSite?.conflictGroup }
        });
        
      } catch (conflictError) {
        console.error('❌ Error creating price conflict:', conflictError);
        // If conflict creation fails, we should still return the website but log the error
      }

      return NextResponse.json({
        ...newSite.toJSON(),
        message: "Website submitted successfully! Since this URL already exists from another user, both submissions are now in price conflict review for admin decision."
      }, { status: 201 });
    }

    // Check for existing website with same title/domain (case-insensitive)
    // This mirrors the URL duplicate logic: same user -> error, different user -> create price conflict
    // Escape title for safe regex use (avoid regex injection) and match exact title case-insensitive
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const existingByTitle = await Website.findOne({
      title: { $regex: `^${escapeRegex(title)}$`, $options: 'i' },
      status: { $in: ['pending', 'approved'] }
    });

    if (existingByTitle) {
      console.log('🔍 Title/domain conflict check:', {
        title,
        existingFound: !!existingByTitle,
        existingStatus: existingByTitle?.status,
        existingUserId: existingByTitle?.userId,
        newUserId: userId
      });

      // If same user submitted the same domain before
      if (existingByTitle.userId === userId) {
        console.log('❌ Same user attempting duplicate submission by title/domain');
        return NextResponse.json({
          error: "This domain has already been published by you. You cannot submit the same domain twice."
        }, { status: 400 });
      }

      console.log('⚔️ Different users - creating price conflict for title/domain');
      // Different user - create price conflict for title
      const newSiteByTitle = await Website.create({
        title,
        url,
        description,
        priceCents: Number(priceCents),
        price: Number(priceCents) / 100,
        category: normalizedCategories, // Use normalized categories
        tags: normalizedTags,
        primaryCountry: primaryCountry || undefined,
        primeTrafficCountries: normalizedPrimeTrafficCountries,
        DA: DA ? Number(DA) : undefined,
        PA: PA ? Number(PA) : undefined,
        Spam: Spam ? Number(Spam) : undefined,
        OrganicTraffic: OrganicTraffic ? Number(OrganicTraffic) : undefined,
        DR: DR ? Number(DR) : undefined,
        RD: RD || undefined,
        trafficValue: trafficValue ? Number(trafficValue) : undefined,
        locationTraffic: locationTraffic ? Number(locationTraffic) : undefined,
        greyNicheAccepted: typeof greyNicheAccepted === 'string' ? (greyNicheAccepted === 'true') : (typeof greyNicheAccepted === 'boolean' ? greyNicheAccepted : undefined),
        specialNotes: specialNotes || undefined,
        userId: userId,
        image: "/default-website-image.png",
        status: "pending",
      });

      try {
        await newSiteByTitle.createPriceConflict(existingByTitle);
        console.log('✅ Price conflict created successfully for title/domain');
      } catch (conflictError) {
        console.error('❌ Error creating price conflict for title/domain:', conflictError);
      }

      return NextResponse.json({
        ...newSiteByTitle.toJSON(),
        message: "Website submitted successfully! Since this domain already exists from another user, both submissions are now in price conflict review for admin decision."
      }, { status: 201 });
    }

    // No conflict - create normally

    const site = await Website.create({
      title,
      url,
      description,
      priceCents: Number(priceCents),
      price: Number(priceCents) / 100,
      category: normalizedCategories, // Use normalized categories
      tags: normalizedTags,
      primaryCountry: primaryCountry || undefined, // Add primaryCountry field
      primeTrafficCountries: normalizedPrimeTrafficCountries, // Add prime traffic countries field
      DA: DA ? Number(DA) : undefined,
      PA: PA ? Number(PA) : undefined,
      Spam: Spam ? Number(Spam) : undefined,
      OrganicTraffic: OrganicTraffic ? Number(OrganicTraffic) : undefined,
      DR: DR ? Number(DR) : undefined,
      RD: RD || undefined,
      trafficValue: trafficValue ? Number(trafficValue) : undefined,
      locationTraffic: locationTraffic ? Number(locationTraffic) : undefined,
  greyNicheAccepted: typeof greyNicheAccepted === 'string' ? (greyNicheAccepted === 'true') : (typeof greyNicheAccepted === 'boolean' ? greyNicheAccepted : undefined),
      specialNotes: specialNotes || undefined,
      userId: userId,
      image: "/default-website-image.png",
      status: "pending",
    });

    return NextResponse.json(site, { status: 201 });
  } catch (error: any) {
    console.error("Error creating website:", error);

    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
    }

    // Remove the old duplicate URL error handling since we now allow duplicates
    // if (error.code === 11000) {
    //   return NextResponse.json({ error: "Website with this URL already exists" }, { status: 400 });
    // }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function getUserRole(userId: string): Promise<string> {
  try {
    // default
    let role = "consumer";

    // env-configured super admins
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || "").toLowerCase() || null;
    const superAdminIds = (process.env.SUPER_ADMIN_USER_IDS || "").split(",").map(s => s.trim()).filter(Boolean);
    if (superAdminIds.includes(userId)) return "superadmin";

    // use Clerk to fetch user email
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const rawEmail = (user?.emailAddresses || []).find((e: any) => e?.primary === true)?.emailAddress
        || (user?.emailAddresses || [])[0]?.emailAddress
        || null;
      const email = rawEmail ? String(rawEmail).toLowerCase().trim() : null;

      if (email && superAdminEmail && email === superAdminEmail) return "superadmin";

      if (email) {
        const roleDoc = await AdminRole.findOne({ email, active: true }).lean().exec();
        if (roleDoc) {
          if (roleDoc.role === 'super') return 'superadmin';
          if (roleDoc.role === 'websites') return 'websites';
          if (roleDoc.role === 'requests') return 'requests';
        }
      }
    } catch (e) {
      // ignore clerk/db errors and fall back to default
      console.error('getUserRole clerk/AdminRole lookup failed', e);
    }

    return role;
  } catch (e) {
    console.error('getUserRole unexpected error', e);
    return 'consumer';
  }
}
