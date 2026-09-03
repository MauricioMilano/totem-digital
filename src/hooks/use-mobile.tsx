import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const update = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    // Sincroniza com o estado externo (matchMedia): leitura inicial + listener.
    mql.addEventListener("change", update)
    update()
    return () => mql.removeEventListener("change", update)
  }, [])

  return !!isMobile
}
