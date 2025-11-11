import React from 'react';

const AnnouncementBar = () => {
  return (
    <div
      className="relative overflow-hidden border-b border-white/15 backdrop-blur-[50px]"
      style={{
        background:
          'radial-gradient(193.87% 204.83% at 32.86% 142.68%, rgba(107, 92, 231, 0) 0%, rgba(107, 92, 231, 0.2) 20%, rgba(107, 92, 231, 0.12) 30%, rgba(255, 107, 53, 0) 80%, rgba(255, 107, 53, 0) 100%), radial-gradient(100% 100% at 50% 100%, rgb(26, 25, 46) 0%, rgb(26, 25, 46) 100%)',
      }}
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-center gap-4 px-6 py-3">
        <div className="font-body text-white sm:text-center text-lg md:text-lg lg:text-xl">
          Go from prompt to possibility with AI Workflow Builder [Beta]
        </div>
        <a
          href="https://docs.n8n.io/release-notes/#ai-workflow-builder-beta"
          className="flex min-h-8 shrink-0 items-center justify-center whitespace-nowrap rounded-lg bg-[#4A80FF] px-6 text-center font-body text-sm font-normal leading-none tracking-[0.3px] text-white transition-colors hover:bg-[#3b6fe0]"
        >
          Learn how
        </a>
      </div>
    </div>
  );
};

export default AnnouncementBar;