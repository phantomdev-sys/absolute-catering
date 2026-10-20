import Link from 'next/link';
import { site } from '@/content/site';
import { aisles } from '@/content/taxonomy';
import { Container } from '@/components/ui/container';
import { NewsletterForm } from './newsletter-form';

/**
 * Footer on the brand plum. The company details block is a legal requirement
 * for a UK limited company; until the client confirms whether they are one
 * (register #16) the fields are empty and render nothing.
 */
export function Footer() {
  const { company, contact } = site;
  const year = new Date().getFullYear();
  const link = 'inline-flex min-h-8 items-center hover:underline focus-visible:outline-focus-inverse';

  return (
    <footer className="mt-auto bg-ground-inverse py-12 text-sm text-ink-inverse">
      <Container width="wide">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-2 md:col-span-2">
            <p className="font-display text-xl font-semibold">{site.name}</p>
            <address className="not-italic leading-relaxed">
              {contact.addressLines.map((l) => (
                <span key={l} className="block">
                  {l}
                </span>
              ))}
            </address>
            {contact.phone && (
              <p>
                <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className={`${link} font-semibold text-teal`}>
                  {contact.phone}
                </a>
              </p>
            )}
          </div>

          <nav aria-label="Shop">
            <p className="mb-2 font-semibold text-teal">Shop</p>
            <ul>
              {aisles.map((a) => (
                <li key={a.slug}>
                  <Link href={`/shop/${a.slug}`} className={link}>
                    {a.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/absolute-range" className={link}>
                  Absolute Range
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="Help">
            <p className="mb-2 font-semibold text-teal">Help</p>
            <ul>
              {site.footerNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={link}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/contact" className={link}>
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 border-t border-ink-inverse/25 pt-8">
          <NewsletterForm />
        </div>

        <div className="mt-10 space-y-1 border-t border-ink-inverse/25 pt-6 text-xs">
          {company.registeredName && (
            <p>
              {company.registeredName}
              {company.number &&
                ` is a company registered in ${company.placeOfRegistration}, company number ${company.number}.`}
            </p>
          )}
          {company.registeredOffice && <p>Registered office: {company.registeredOffice}</p>}
          {company.vatNumber && <p>VAT registration number: {company.vatNumber}</p>}
          <p>
            © {year} {site.name}
          </p>
        </div>
      </Container>
    </footer>
  );
}
