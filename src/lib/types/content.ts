/**
 * Shape of the static, non-admin-managed site chrome: navigation structure,
 * brand identity and contact details.
 *
 * Anything that will later be editable from the admin console (products,
 * categories, prices, images, homepage section copy, commerce settings) must
 * NOT live here — it belongs in the database. See ARCHITECTURE.md.
 */

export interface NavLink {
	label: string;
	href: string;
	/**
	 * Dropdown children. The `/shop` entry deliberately ships with none: its
	 * children are product categories, which are admin-managed and get merged
	 * in from the database by the `(site)` layout load once P2 lands.
	 */
	children?: NavLink[];
}

export interface SocialLink {
	label: string;
	href: string;
	icon: 'instagram' | 'facebook' | 'youtube';
}

export interface ContactDetails {
	addressLines: string[];
	/** E.164, used to build the `tel:` href. */
	phone: string;
	phoneDisplay: string;
	email: string;
	hours: string[];
}

export interface FooterColumn {
	heading: string;
	links: NavLink[];
}

export interface SiteContent {
	brandName: string;
	brandTagline: string;
	footerBlurb: string;
	nav: NavLink[];
	footerColumns: FooterColumn[];
	social: SocialLink[];
	contact: ContactDetails;
}
