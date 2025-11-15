import Image from 'next/image';
import { Check } from 'lucide-react';

const features = [
  "List websites in minutes with our simple form",
  "Browse and filter thousands of sites instantly",
  "Manage campaigns with real-time analytics",
  "Use templates to jump-start your advertising",
];

const RunTweakRepeat = () => {
  return (
    <section className="relative bg-background-secondary py-16 sm:py-28 lg:py-16 overflow-hidden">
      <div className="absolute inset-0 hidden lg:block">
        <video
          className="absolute right-0 top-1/2 h-auto w-full -translate-y-1/2 transform opacity-30 mix-blend-screen"
          autoPlay
          loop
          muted
          playsInline
          key="https://n8n.io/videos/run-tweak-repeat.mp4"
        >
          <source src="https://n8n.io/videos/run-tweak-repeat.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-12 lg:gap-x-8 items-center">
          <div className="lg:col-span-5 text-center lg:text-left">
            <div className="mx-auto lg:mx-0 mb-8 inline-flex h-[72px] w-[72px] items-center justify-center rounded-full bg-white/5 p-4 border border-white/10">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/e79c8e31-5e69-41e7-8693-2f24ba98b3f5-n8n-io/assets/images/thunder-7.webp"
                alt="Lightning bolt icon"
                width={40}
                height={40}
                className="h-10 w-10"
              />
            </div>
            
            <h2 className="text-headline-xs font-medium text-text-primary mb-4">
              List. Discover. Transact.
            </h2>
            
            <p className="text-md text-text-secondary max-w-md mx-auto lg:mx-0 mb-10">
              The same simplicity that makes online marketplaces work.
            </p>
          </div>

          <div className="lg:col-span-7">
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-6 w-6 text-accent-purple mr-3 mt-1 flex-shrink-0" />
                  <span className="text-md text-text-primary">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RunTweakRepeat;