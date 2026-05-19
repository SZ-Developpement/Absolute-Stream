import { LibraryContainerProps } from "@/types/medias";
import Link from "next/link";

export default function LibraryContainer({
  Title,
  link,
  children,
}: LibraryContainerProps) {
  return (
    <div className="pb-6 lg:pb-14 flex flex-col gap-4 w-full">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2">
        <h3 className="text-lg xl:text-xl  font-semibold capitalize ">
          {Title}
        </h3>
        <Link
          href={link}
          className="text-sm text-blue-500 hover:text-blue-600 font-medium"
        >
          Voir tout
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-6">
        {children}
      </div>
    </div>
  );
}
