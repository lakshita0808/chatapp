import Image from "next/image";

export function Avatar({
  name,
  src,
  size = 36
}: {
  name: string;
  src?: string;
  size?: number;
}) {
  if (src) {
    return (
      <Image
        alt={name}
        className="rounded-full object-cover"
        height={size}
        src={src}
        width={size}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase text-muted-foreground"
      style={{ width: size, height: size }}
    >
      {name.slice(0, 2)}
    </div>
  );
}
