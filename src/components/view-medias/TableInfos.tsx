import { TableInfosProps } from "@/types/medias";

export default function TableInfos({ name, children }: TableInfosProps) {
  return (
    <div className="flex flex-col gap-0.5 tracking-tighter">
      <div className=" text-[#737373]">{name}</div>
      <div className="text-sm font-medium text-[#D4D4D4]">{children}</div>
    </div>
  );
}
