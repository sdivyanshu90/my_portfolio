"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { contactInfo } from "@/lib/config-loader";

export interface ContactCardData {
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    availability?: string;
    portfolio?: string;
    handle?: string;
  };
  socialProfiles?: Record<string, string>;
}

export function Contact({ data }: { data?: ContactCardData }) {
  const email = data?.contact?.email ?? contactInfo.email;
  const phone = data?.contact?.phone ?? contactInfo.phone;
  const location = data?.contact?.location;
  const availability = data?.contact?.availability;
  const handle = data?.contact?.handle ?? contactInfo.handle;
  const portfolio = data?.contact?.portfolio ?? contactInfo.portfolio;
  const socials = data?.socialProfiles
    ? Object.entries(data.socialProfiles)
        .filter(([, url]) => Boolean(url))
        .map(([name, url]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1),
          url,
        }))
    : contactInfo.socials;

  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mx-auto mt-8 w-full min-w-0">
      <div className="bg-[#0e1520] w-full min-w-0 overflow-hidden rounded-3xl px-6 py-8 font-sans sm:px-10 md:px-16 md:py-12">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-[#e2e8f0] text-3xl font-semibold md:text-4xl">
            Contacts
          </h2>
          <span className="text-safe-wrap mt-2 sm:mt-0">{handle}</span>
        </div>

        <div className="mt-8 flex flex-col md:mt-10">
          <div
            className="group mb-5 cursor-pointer"
            onClick={() => openLink(`mailto:${email}`)}
          >
            <div className="flex items-center gap-1">
              <span className="break-all text-base font-medium text-blue-500 hover:underline sm:text-lg">
                {email}
              </span>
              <ChevronRight className="h-5 w-5 text-blue-500 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>

          <div className="mb-6 flex flex-col gap-2 text-sm text-[#8b9db5]">
            {phone ? <span className="text-safe-wrap">{phone}</span> : null}
            {portfolio ? (
              <button
                type="button"
                className="text-safe-wrap w-fit text-left text-blue-500 hover:underline"
                onClick={() => openLink(portfolio)}
              >
                Visit portfolio
              </button>
            ) : null}
            {location ? (
              <span className="text-safe-wrap">{location}</span>
            ) : null}
            {availability ? (
              <span className="text-safe-wrap">{availability}</span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-5 sm:gap-x-8">
            {socials.map((social) => (
              <button
                key={social.name}
                className="text-[#8b9db5] hover:text-[#e2e8f0] cursor-pointer text-sm transition-colors"
                onClick={() => openLink(social.url)}
                title={social.name}
              >
                {social.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
