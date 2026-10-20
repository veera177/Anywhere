// SVG shell used as a common marker
const _SVG_SHELL_TARGET = <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />;

export function Anywhere({ c = 'brand-mark', w = 30, h = 30 }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={c}
            width={w} height={h} viewBox="0 0 24 24"
            fill="currentColor" stroke="currentColor" strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
        </svg>
    );
}


function _icon(children, props) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
            aria-hidden="true" {...props}>
            {children}
        </svg>
    );
}

// Every exported icon forwards props (notably className) to the <svg>, so
// callers can size/colour them with existing CSS classes.
const _withProps = (children) => (props) => _icon(children, props);

export const Food = _withProps(<path d="M3.5 6.5A1.5 1.5 0 0 1 5 5h9a1.5 1.5 0 0 1 1.5 1.5v0A1.5 1.5 0 0 1 15.5 7.5H5a1.5 1.5 0 0 0-1.5 1.5v0a1.5 1.5 0 0 0 1.5 1.5h1.5" />);

export const Restaurant = _withProps(
    <>
        <path d="M3 2v4a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V2" />
        <path d="M8 22v-6h8v6" />
        <path d="M12 14v4" />
    </>
);

export const Grocery = _withProps(
    <>
        <path d="M3 3h18v18H3z" />
        <path d="M9 9h6" />
        <path d="M9 13h6" />
        <path d="M9 17h4" />
    </>
);

export const Store = _withProps(
    <>
        <path d="M3 9l9-7 9 7v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
        <path d="M9 22v-5h6v5" />
    </>
);

export const Medicine = _withProps(
    <>
        <path d="M8 3h8v10l-4 6-4-6V3z" />
        <path d="M6 3v3" />
        <path d="M18 3v3" />
    </>
);

export const Pharmacy = _withProps(
    <>
        <path d="M9 7h6v10H9z" />
        <path d="M7 3v3" />
        <path d="M17 3v3" />
    </>
);

export const Courier = _withProps(
    <>
        <circle cx="9" cy="11" r="1.5" fill="currentColor" />
        <rect x="11" y="9" width="10" height="8" rx="1" />
        <path d="M15 18l3 3" />
    </>
);

export const MapPin = _withProps(
    <>
        <path d="M12 21s-6-5.5-7-11a7 7 0 1 0 14 0c0 5.5-7 11-7 11z" />
        <circle cx="12" cy="10" r="2.4" />
    </>
);

export const Map = _withProps(
    <>
        <path d="M21 10c0 6-13 14-15 14S1 16 1 10c0-4 3-8 9-10 6 2 9 6 9 10z" />
        <circle cx="12" cy="10" r="3" />
        <path d="M2 10h3" />
        <path d="M19 10h3" />
    </>
);

export const Cart = _withProps(
    <>
        <circle cx="9" cy="21" r="1.5" fill="currentColor" />
        <circle cx="18" cy="7" r="1.5" fill="currentColor" />
        <path d="M1 1h4l2 2h16v12h-5" />
        <path d="M19 7l-2 4-2-4" />
    </>
);

export const User = _withProps(
    <>
        <circle cx="12" cy="8" r="4" />
        <path d="M3 22v-4a6 6 0 0 1 12 0v4" />
    </>
);

export const Signout = _withProps(
    <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
    </>
);

export const Search = _withProps(
    <>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4-4" />
    </>
);

export const AI = _withProps(
    <>
        <path d="M12 21s-8-7.5-8-13a8 8 0 1 1 16 0c0 5.5-8 13-8 13z" />
        <circle cx="12" cy="11" r="2" fill="currentColor" />
    </>
);

export const Upload = _withProps(
    <>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M17 8l-5-5-5 5" />
        <path d="M12 3v12" />
    </>
);

export const Clipboard = _withProps(
    <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 9h6" />
        <path d="M9 13h6" />
        <path d="M9 17h3" />
    </>
);

export const Close = _withProps(
    <>
        <path d="M18 6L6 18" />
        <path d="M6 6l12 12" />
    </>
);

export const Send = _withProps(
    <>
        <path d="M22 2L11 13" />
        <path d="M22 2L15 22L11 13L2 9l20-7z" />
    </>
);

export const ArrowLeft = _withProps(
    <>
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
    </>
);

export const ArrowRight = _withProps(
    <>
        <path d="M5 12h14" />
        <path d="M12 5l7 7-7 7" />
    </>
);

export const Star = _withProps(
    <path d="M12 2l2.4 6.6h6.6l-5.8 4 2.1 6.4L12 17.2l-6.1 3.6 2.1-6.4L2.2 8.6h6.6z" fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
);

export const ChevronDown = () => <path d="M6 9l6 6 6-6" />;

export const Warning = _withProps(
    <>
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h17.08a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    </>
);

export const Check = _withProps(
    <path d="M20 6L9 17l-5-5" fill="currentColor" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
);

/**
 * Icons — namespace object so callers can write <Icons.Cart /> etc.
 * Every member is a lightweight inline SVG (no icon library dependency).
 */
export const Icons = {
    Anywhere,
    Food,
    Restaurant,
    Grocery,
    Store,
    Medicine,
    Pharmacy,
    Courier,
    MapPin,
    Map,
    Cart,
    User,
    Signout,
    Search,
    AI,
    Upload,
    Clipboard,
    Close,
    Send,
    ArrowLeft,
    ArrowRight,
    Star,
    ChevronDown,
    Warning,
    Check,
};
