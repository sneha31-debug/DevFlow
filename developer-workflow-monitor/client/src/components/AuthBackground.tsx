

const AuthBackground = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[128px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[128px] animate-pulse delay-1000" />
            <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-violet-500/10 rounded-full blur-[96px] animate-pulse delay-700" />
        </div>
    );
};

export default AuthBackground;
