export const AuthStyles = {
    // Page Background: Deep dark background
    page: "min-h-screen flex items-center justify-center relative overflow-hidden bg-[#020204] text-white font-sans p-4",

    // Card Wrapper: Substantially wider
    cardWrapper: "relative group w-full max-w-[500px] mx-auto",

    // Card Glow: Subtle backlight effect
    cardGlow: "absolute -inset-0.5 bg-gradient-to-b from-white/10 to-transparent rounded-2xl opacity-20 blur-md transition duration-1000",

    // Main Card: Dark Zinc-950 background, substantial padding
    card: "relative p-10 md:p-14 rounded-3xl border border-white/5 bg-[#09090b] shadow-2xl shadow-black/90 backdrop-blur-sm",

    // Icon Badge: Larger container
    iconBadge: "mx-auto w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-8 text-white shadow-lg",

    // Typography: Impactful title
    title: "text-4xl md:text-5xl font-bold text-center mb-4 tracking-tight text-white",
    subtitle: "text-center text-zinc-400 text-base mb-12 font-medium",

    // Form Elements
    error: "mb-8 p-4 bg-red-500/10 border border-red-500/10 rounded-xl text-red-400 text-sm flex items-center gap-3 text-center justify-center",

    // GitHub Button: Taller and consistent
    githubBtn: "w-full flex items-center justify-center gap-3 bg-[#18181b] hover:bg-[#27272a] text-white py-5 px-6 rounded-xl border border-white/5 font-bold text-base transition-all mb-10 shadow-md hover:border-white/10",

    // Divider: More breathing room
    divider: "relative py-4 flex items-center justify-center mb-10",
    dividerLine: "absolute top-1/2 left-0 w-full border-t border-white/5",
    dividerText: "relative bg-[#09090b] px-4 text-xs font-bold text-zinc-500 uppercase tracking-widest z-10 text-white/40",

    // Inputs: Taller, spacious, larger text
    label: "block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3",
    inputWrapper: "relative group mb-8",
    inputIcon: "absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-500 group-focus-within:text-white transition-colors z-10",
    input: "w-full bg-[#09090b] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-base text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all shadow-sm [&:-webkit-autofill]:shadow-[0_0_0_1000px_#09090b_inset] [&:-webkit-autofill]:-webkit-text-fill-color-white",

    // Submit Button: Larger target
    submitBtn: "w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-indigo-500/20 mt-8 flex items-center justify-center gap-2 hover:-translate-y-0.5",

    // Footer
    footerText: "mt-12 text-center text-sm text-zinc-500 font-medium",
    footerLink: "text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition-colors hover:underline"
};
