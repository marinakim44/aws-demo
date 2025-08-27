const costModelOptions = [
  { value: "idle", label: "Idle resource billing" },
  { value: "pay-per-use", label: "Pay-per-use (e.g. Lambda, Fargate)" },
  { value: "predictable", label: "Predictable billing" },
  { value: "variable", label: "Variable billing (spikes)" },
];
const timeToMarketOptions = [
  { value: "prototype-speed", label: "Prototype speed (days)" },
  { value: "moderate-setup", label: "Moderate setup (weeks)" },
  { value: "full-control", label: "Full control (months)" },
];
const scalabilityNeedsOptions = [
  { value: "low", label: "Startup/Low-volume" },
  { value: "auto-scaling", label: "Medium volume" },
  { value: "global-scale", label: "High volume/Rapid growth" },
];

const opsOverheadOptions = [
  { value: "minimal", label: "Minimal ops overhead" },
  { value: "some", label: "Some ops overhead" },
  { value: "high", label: "High ops overhead" },
];
const flexibilityOptions = [
  { value: "constrained", label: "Constrained flexibility" },
  { value: "moderate", label: "Moderate flexibility" },
  { value: "maximum", label: "Maximum flexibility" },
];
const latencyProfileOptions = [
  { value: "low-p95", label: "Low" },
  { value: "medium-p95", label: "Medium" },
  { value: "high-p95", label: "High" },
];
const coldStartToleranceOptions = [
  { value: "cold-start-ok", label: "Cold start OK" },
  { value: "cold-start-minimal", label: "Cold start minimal" },
];
const complianceLevelOptions = [
  { value: "none", label: "No compliance requirements" },
  { value: "basic", label: "Basic compliance requirements" },
  { value: "strict", label: "Strict compliance requirements" },
];
const scopeStabilityOptions = [
  { value: "fixed", label: "Fixed scope" },
  { value: "evolving", label: "Evolving scope" },
];
const dataVolumeOptions = [
  { value: "kb-mb", label: "Low" },
  { value: "mb-gb", label: "Medium" },
  { value: "gb-tb", label: "High" },
  { value: "not-applicable", label: "Not applicable" },
];
const availabilityOptions = [
  { value: "99-9", label: "Basic" },
  { value: "99-99", label: "Resilient" },
  { value: "99-999", label: "High availability" },
];
const trafficPatternOptions = [
  { value: "steady", label: "Steady traffic" },
  { value: "spiky", label: "Spiky traffic" },
  { value: "burst", label: "Burst traffic" },
];

export const data = [
  {
    name: "costModel",
    label: "Cost Model",
    options: costModelOptions,
  },
  {
    name: "timeToMarket",
    label: "Time to Market",
    options: timeToMarketOptions,
  },
  {
    name: "scalabilityNeeds",
    label: "Scalability Needs",
    options: scalabilityNeedsOptions,
  },
  {
    name: "opsOverhead",
    label: "Ops Overhead",
    options: opsOverheadOptions,
  },
  {
    name: "flexibility",
    label: "Flexibility",
    options: flexibilityOptions,
  },
  {
    name: "latencyProfile",
    label: "Latency Profile",
    options: latencyProfileOptions,
  },
  {
    name: "coldStartTolerance",
    label: "Cold Start Tolerance",
    options: coldStartToleranceOptions,
  },
  {
    name: "complianceLevel",
    label: "Compliance Level",
    options: complianceLevelOptions,
  },
  {
    name: "scopeStability",
    label: "Scope Stability",
    options: scopeStabilityOptions,
  },
  {
    name: "dataVolumeOptions",
    label: "Data Volume Options",
    options: dataVolumeOptions,
  },
  {
    name: "availabilityOptions",
    label: "Availability Options",
    options: availabilityOptions,
  },
  {
    name: "trafficPattern",
    label: "Traffic Pattern",
    options: trafficPatternOptions,
  },
];
