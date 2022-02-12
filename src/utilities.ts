import { platform, env } from "process"

export const getCacheDirectory = () => {
    if (platform == "darwin") {
        return env.HOME + "/Library/Caches/Dashboard"
    } else if (platform == "win32") {
        return env.LOCALAPPDATA + "/Dashboard"
    }
    return (env.XDG_CACHE_HOME ?? env.HOME + "/.cache") + "/Dashboard"
}
