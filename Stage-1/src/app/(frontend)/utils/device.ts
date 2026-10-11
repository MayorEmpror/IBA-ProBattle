/**
 * Detects if the client is on a mobile phone
 * @returns {boolean} True if client is on a mobile device
 */

function isMobileDevice(window: Window & typeof globalThis): boolean {
    // Check using user agent (less reliable but still useful)
    const userAgentCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
  
    // Check using screen width (more reliable for most phones)
    const screenWidthCheck = window.innerWidth <= 768
  
    // Check using touchpoints (most modern phones have multiple touch points)
    const touchPointCheck = 'ontouchstart' in window && navigator.maxTouchPoints > 1
  
    // Check using media query for mobile devices
    const mediaQueryCheck = window.matchMedia('(max-width: 768px) and (pointer: coarse)').matches
  
    // Combined check for higher confidence
    return userAgentCheck || (screenWidthCheck && touchPointCheck) || mediaQueryCheck
  }

  
export {
    isMobileDevice
}