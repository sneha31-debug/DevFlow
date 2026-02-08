export const AuthStyles = {
    // Page Background: Deep dark background
    page: "min-h-screen flex items-center justify-center relative overflow-hidden bg-[#020204] text-white font-sans p-4",

    // Card Wrapper: Substantially wider
    cardWrapper: "relative group w-full max-w-[600px] mx-auto",

    // Card Glow: Subtle backlight effect
    cardGlow: "absolute -inset-0.5 bg-gradient-to-b from-white/10 to-transparent rounded-3xl opacity-20 blur-md transition duration-1000",

    // Main Card: Dark Zinc-950 background, substantial padding
    card: "relative p-12 md:p-16 rounded-[2rem] border border-white/5 bg-[#09090b] shadow-2xl shadow-black/90 backdrop-blur-sm",

    // Icon Badge: Larger container
    iconBadge: "mx-auto w-20 h-20 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mb-10 text-white shadow-lg",

    // Typography: Impactful title
    title: "text-5xl md:text-6xl font-bold text-center mb-6 tracking-tight text-white",
    subtitle: "text-center text-zinc-400 text-lg mb-14 font-medium",

    // Form Elements
    error: "mb-10 p-5 bg-red-500/10 border border-red-500/10 rounded-xl text-red-400 text-base flex items-center gap-3 text-center justify-center",

    // GitHub Button: More distinct button look
    githubBtn: "w-full flex items-center justify-center gap-4 bg-zinc-800 hover:bg-zinc-700 text-white py-6 px-8 rounded-2xl border border-white/10 font-bold text-lg transition-all mb-12 shadow-md hover:shadow-lg hover:-translate-y-0.5",

    // Divider: More breathing room
    divider: "relative py-6 flex items-center justify-center mb-12",
    dividerLine: "absolute top-1/2 left-0 w-full border-t border-white/10",
    dividerText: "relative bg-[#09090b] px-6 text-sm font-bold text-zinc-400 uppercase tracking-widest z-10",

    // Inputs: Taller, spacious, larger text
    label: "block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4",
    inputWrapper: "relative group mb-10",
    inputIcon: "absolute left-6 top-1/2 -translate-y-1/2 h-7 w-7 text-zinc-400 group-focus-within:text-white transition-colors z-10",
    input: "w-full bg-[#09090b] border border-white/10 rounded-2xl py-6 pl-16 pr-6 text-lg text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm [&:-webkit-autofill]:shadow-[0_0_0_1000px_#09090b_inset] [&:-webkit-autofill]:-webkit-text-fill-color-white",

    // Submit Button: Larger target
    submitBtn: "w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-6 rounded-2xl font-bold text-xl transition-all shadow-lg shadow-indigo-500/20 mt-10 flex items-center justify-center gap-3 hover:-translate-y-0.5",

    // Footer
    footerText: "mt-14 text-center text-base text-zinc-400 font-medium",
    footerLink: "text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition-colors hover:text-white hover:underline"
};
