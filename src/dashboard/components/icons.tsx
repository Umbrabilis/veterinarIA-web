export function HuesoLogo({ size = 32, color = 'white' }: { size?: number; color?: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 1080 1080"
            fill={color}
            xmlns="http://www.w3.org/2000/svg"
        >
            <g transform="translate(0,1080) scale(0.1,-0.1)">
                <path d="M2329 7359 c-395 -34 -777 -289 -934 -622 -146 -307 -96 -644 154
-1032 278 -430 270 -641 -38 -1054 -119 -160 -195 -353 -208 -522 -31 -428
296 -879 742 -1023 190 -61 433 -78 599 -42 359 78 613 333 765 768 16 47 41
108 55 135 51 100 161 175 282 190 32 5 811 6 1729 3 l1670 -5 57 -27 c78 -36
110 -89 217 -350 112 -275 160 -356 281 -479 85 -87 106 -102 200 -147 237
-115 507 -138 782 -68 210 53 366 136 501 265 359 343 393 835 89 1317 -67
108 -145 265 -174 350 -33 98 -32 279 1 374 32 91 94 216 158 318 133 210 196
348 228 496 22 100 16 266 -14 379 -73 278 -286 532 -554 662 -173 83 -336
111 -602 102 -250 -8 -408 -51 -537 -147 -146 -107 -223 -258 -298 -575 -131
-556 -485 -970 -930 -1090 -268 -71 -536 -54 -878 56 -243 78 -324 77 -588
-10 -82 -27 -192 -57 -244 -66 -127 -24 -363 -25 -481 -2 -353 70 -644 282
-837 612 -65 110 -116 237 -182 452 -72 233 -136 372 -220 476 -97 121 -196
195 -330 246 -137 53 -303 74 -461 60z"/>
                <path d="M5242 7349 c-282 -47 -432 -213 -432 -479 0 -249 124 -401 376 -461
76 -18 110 -20 239 -16 95 3 172 10 210 21 292 81 426 305 348 586 -49 179
-188 302 -388 345 -76 16 -267 18 -353 4z"/>
            </g>
        </svg>
    )
}

export function BoneIcon({ size = 24, color = 'currentColor' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 40 24" fill={color}>
            <circle cx="8" cy="6" r="5.5" />
            <circle cx="8" cy="18" r="5.5" />
            <circle cx="32" cy="6" r="5.5" />
            <circle cx="32" cy="18" r="5.5" />
            <rect x="9" y="8" width="22" height="8" rx="2" />
        </svg>
    )
}

export function PawIcon({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
            <circle cx="6" cy="8" r="2.5" />
            <circle cx="10" cy="5" r="2" />
            <circle cx="14" cy="5" r="2" />
            <circle cx="18" cy="8" r="2.5" />
            <path d="M12 9c-4 0-7 3-7 6.5C5 18.5 7.5 21 12 21s7-2.5 7-5.5C19 12 16 9 12 9z" />
        </svg>
    )
}

export function HomeIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
    )
}

export function CalendarIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    )
}

export function UsersIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87"/>
            <path d="M16 3.13a4 4 0 010 7.75"/>
        </svg>
    )
}

export function ClipboardIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
        </svg>
    )
}

export function BarChartIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/>
            <line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
    )
}

export function UserIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
        </svg>
    )
}

export function HelpCircleIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
    )
}

export function ChevronRightIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
        </svg>
    )
}

export function ChevronDownIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
        </svg>
    )
}

export function SearchIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    )
}

export function PlusIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
    )
}

export function ArrowLeftIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
        </svg>
    )
}

export function SparklesIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/>
            <path d="M5 17l.8 2.2L8 20l-2.2.8L5 23l-.8-2.2L2 20l2.2-.8L5 17z"/>
            <path d="M19 2l.6 1.8L21.4 4l-1.8.6L19 6.4l-.6-1.8L16.6 4l1.8-.6L19 2z"/>
        </svg>
    )
}

export function SendIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
    )
}

export function EditIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
    )
}

export function CheckIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    )
}

export function LockIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
    )
}

export function AlertCircleIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
    )
}

export function HomeOutlineIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
    )
}
