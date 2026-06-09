export const SITE_SETTINGS_ID = "default"

export const DEFAULT_SITE_SETTINGS = {
  id: SITE_SETTINGS_ID,
  siteName: "x67secretme",
  siteDescription: "",
  promptPayNumber: "",
  promptPayName: "",
  pointsPerBaht: 1,
  pointsValue: 0.1,
  minTopup: 10,
  maxTopup: 10000,
  angpaoEnabled: true,
  angpaoAutoApprove: true,
  angpaoApiEndpoint: "http://apitrue.vornyx.pro/truemoney",
  angpaoApiKey: "",
  angpaoReceiverPhone: "",
  angpaoAllowedHosts: "gift.truemoney.com,tmn.app",
} as const
