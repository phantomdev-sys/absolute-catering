import { createElement } from 'react';
import Image from 'next/image';
import {
  Beef,
  CakeSlice,
  CupSoda,
  Drumstick,
  Egg,
  Fish,
  Gift,
  Ham,
  Hamburger,
  House,
  Package,
  Pizza,
  ShoppingBasket,
  Snowflake,
  Sparkles,
  UtensilsCrossed,
  WheatOff,
  type LucideIcon,
} from 'lucide-react';
import packshots from '@/content/packshots.json';
import { primaryPlacement, type Product } from '@/lib/catalogue';
import { cn } from '@/lib/cn';

/**
 * Product image, keyed by slug.
 *
 * The client's packshots land in public/images/packshots/ (see
 * scripts/sync-packshots.mjs). Until a product has one it gets a neutral
 * placeholder: an icon for its shelf on the paper ground. The old WordPress
 * images are not used — they are social-media screenshots with prices and
 * captions printed on them, which would show unconfirmed prices on the page.
 */

const SHELF_ICON: Record<string, LucideIcon> = {
  'fresh/bacon': Ham,
  'fresh/sausages-and-puddings': Beef,
  'fresh/chicken-and-kebabs': Drumstick,
  'fresh/burgers': Hamburger,
  'fresh/eggs': Egg,
  'fresh/cakes-and-desserts': CakeSlice,
  'fresh/pizza': Pizza,
  'frozen/chicken': Drumstick,
  'frozen/pizza-and-snacks': Pizza,
  'frozen/kebab-meat': Beef,
  'frozen/turkey': Drumstick,
  'household/foil-and-trays': Package,
  'household/cups-glasses-and-straws': CupSoda,
  'household/plates-and-cutlery': UtensilsCrossed,
  'household/paper-and-cleaning': Sparkles,
  'household/for-the-home': House,
};

const AISLE_ICON: Record<string, LucideIcon> = {
  frozen: Snowflake,
  'gluten-free': WheatOff,
  seasonal: Gift,
};

function iconFor(product: Product): LucideIcon {
  if (/salmon|fish/i.test(product.name)) return Fish;
  const home = primaryPlacement(product);
  if (!home) return ShoppingBasket;
  return (
    (home.shelf && SHELF_ICON[`${home.aisle.slug}/${home.shelf.slug}`]) ||
    AISLE_ICON[home.aisle.slug] ||
    ShoppingBasket
  );
}

type Packshot = { front?: string; back?: string };

export function packshotFor(slug: string): Packshot {
  return (packshots as Record<string, Packshot>)[slug] ?? {};
}

export function ProductImage({
  product,
  sizes,
  priority,
  className,
}: {
  product: Product;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const shot = packshotFor(product.slug).front;

  if (shot) {
    return (
      <div className={cn('relative aspect-square overflow-hidden bg-ground', className)}>
        <Image
          src={shot}
          alt={product.name}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain p-3"
        />
      </div>
    );
  }

  // createElement rather than <Icon />: the icon is looked up, not defined,
  // during render, but the hooks linter can't tell the difference.
  const icon = createElement(iconFor(product), {
    'aria-hidden': true,
    strokeWidth: 1.25,
    className: 'size-1/3 opacity-80',
  });
  return (
    <div
      className={cn(
        'relative flex aspect-square flex-col items-center justify-center gap-3 bg-ground-subtle text-brand',
        className,
      )}
    >
      {icon}
      <span className="text-xs font-medium tracking-wide text-ink-muted">Photo coming soon</span>
    </div>
  );
}
