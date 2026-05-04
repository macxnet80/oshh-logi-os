"use client";

type Option = { id: string; name: string };

export default function ZeitenFreelancerFilter({
  options,
  range,
  fromParam,
  toParam,
  selectedId,
}: {
  options: Option[];
  range: string;
  fromParam?: string;
  toParam?: string;
  selectedId: string;
}) {
  const base = "/admin/freelancers/zeiten";

  const navigate = (freelancerId: string) => {
    const u = new URLSearchParams();
    u.set("range", range);
    if (range === "custom" && fromParam && toParam) {
      u.set("from", fromParam);
      u.set("to", toParam);
    }
    if (freelancerId) u.set("freelancer", freelancerId);
    window.location.href = u.toString() ? `${base}?${u.toString()}` : base;
  };

  return (
    <div className="flex-1 min-w-[200px]">
      <label
        htmlFor="freelancer-filter"
        className="font-body text-xs font-medium text-gray-600 mb-2 block"
      >
        Freelancer
      </label>
      <select
        id="freelancer-filter"
        className="w-full max-w-md px-4 py-2.5 rounded-lg border border-gray-200 font-body text-sm bg-white text-orendt-black"
        value={selectedId}
        onChange={(e) => {
          navigate(e.target.value);
        }}
      >
        <option value="">Alle</option>
        {options.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
    </div>
  );
}
