
'use client';

import Link, { type LinkProps } from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from './transition-provider';

type TransitionLinkProps = LinkProps & {
  children: React.ReactNode;
  className?: string;
};

const TransitionLink: React.FC<TransitionLinkProps> = ({ children, href, className, ...props }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { setLoading } = useTransition();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (pathname !== href.toString()) {
      setLoading(true);
      setTimeout(() => {
        router.push(href.toString());
        // No need to setLoading(false) here, as the new page will mount and reset it.
      }, 50); // Wait for the animation to start
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className} {...props}>
      {children}
    </Link>
  );
};

export default TransitionLink;
