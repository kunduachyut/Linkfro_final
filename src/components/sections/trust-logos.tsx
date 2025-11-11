import Image from 'next/image';

const logos = [
  {
    src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/svgs/re_dedatech_18e7e6253b-1.svg',
    alt: 'Example Publisher 1',
    width: 100,
    height: 24,
  },
  {
    src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/svgs/unbabel_1392f8b8ac_cca31eda86-4.svg',
    alt: 'Example Publisher 2',
    width: 162,
    height: 24,
  },
  {
    src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/svgs/microsoft_a60b0da7d8-7.svg',
    alt: 'Example Publisher 3',
    width: 114,
    height: 25,
  },
  {
    src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/svgs/re_vodafone_6deed71a6c-3.svg',
    alt: 'Example Publisher 4',
    width: 137,
    height: 24,
  },
  {
    src: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/svgs/wayfair_a7aacce828-2.svg',
    alt: 'Example Publisher 5',
    width: 108,
    height: 24,
  },
];

const TrustLogos = () => {
  const allLogos = [...logos, ...logos, ...logos, ...logos];

  return (
    <section className="w-full bg-background pb-14">
      <div className="max-w-[1440px] mx-auto px-8 md:px-12 lg:px-14 xl:px-[100px]">
        <p className="text-center font-body text-md leading-loose text-text-secondary">
          Trusted by leading website publishers and advertisers
        </p>

        <div className="relative mt-10">
          <div className="overflow-hidden">
            <div className="flex animate-marquee items-center gap-x-18 whitespace-nowrap">
              {allLogos.map((logo, index) => (
                <div key={index} className="flex-shrink-0">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={logo.width}
                    height={logo.height}
                    className="h-6 w-auto object-contain opacity-60"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[124px] bg-gradient-to-r from-background to-transparent md:w-[152px]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[124px] bg-gradient-to-l from-background to-transparent md:w-[152px]" />
        </div>
      </div>
    </section>
  );
};

export default TrustLogos;