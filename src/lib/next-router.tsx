"use client";

import NextLink from "next/link";
import {
  usePathname,
  useRouter,
  useParams as useNextParams,
} from "next/navigation";
import type { ComponentProps, ReactNode } from "react";

type NextLinkProps = ComponentProps<typeof NextLink>;

interface LinkProps extends Omit<NextLinkProps, "href"> {
  to?: NextLinkProps["href"];
  href?: NextLinkProps["href"];
  children?: ReactNode;
}

export function Link({
  to,
  href,
  children,
  ...props
}: LinkProps) {
  const destination = href ?? to ?? "/";

  return (
    <NextLink
      href={destination}
      {...props}
    >
      {children}
    </NextLink>
  );
}

interface NavigateOptions {
  replace?: boolean;
}

export function useNavigate() {
  const router = useRouter();

  return (to: string | number, options?: NavigateOptions) => {
    if (typeof to === "number") {
      if (to === -1) {
        router.back();
      } else if (to === 1) {
        router.forward();
      }
      return;
    }

    if (options?.replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  };
}

export function useLocation() {
  const pathname = usePathname();

  return {
    pathname,
    search: typeof window !== "undefined"
      ? window.location.search
      : "",
    hash: typeof window !== "undefined"
      ? window.location.hash
      : "",
  };
}

export function useParams<
  T extends Record<string, string | string[] | undefined> = Record<
    string,
    string | string[] | undefined
  >,
>() {
  const nextParams = useNextParams<Record<string, string | string[] | undefined>>();
  const pathname = usePathname() || '';
  const idRoutePatterns = [
    /^\/blog\/([^/]+)\/?$/,
    /^\/admin\/crm\/leads\/([^/]+)\/?$/,
    /^\/admin\/crm\/customers\/([^/]+)\/?$/,
  ];
  const idMatch = idRoutePatterns
    .map((pattern) => pathname.match(pattern))
    .find((match) => match !== null);

  if (idMatch) {
    return { id: decodeURIComponent(idMatch[1]) } as unknown as T;
  }

  return nextParams as T;
}