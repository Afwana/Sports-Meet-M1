import { Button } from "@heroui/react";
import Link from "next/link";

export default function PendingRequests() {
  return (
    <div className="flex flex-col gap-3 max-w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col">
          <h3 className="text-base md:text-lg font-semibold">
            Pending Requests
          </h3>
          <p className="text-[10px] md:text-xs">
            Employees waiting for captain approval.
          </p>
        </div>
        <Link
          href="/captain/requests"
          className="text-xs md:text-sm text-blue-600 underline"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <div className="border border-gray-200 rounded-xl p-3 flex flex-col xl:flex-row justify-between gap-2">
          <div className="flex flex-col gap-1">
            <p className="text-sm xl:text-base font-semibold">
              Employee Name - Employee Code
            </p>
            <p className="text-xs xl:text-sm font-medium">
              Request description
            </p>
          </div>
          <div className="flex xl:flex-col gap-1 xl:items-end">
            <Button
              className="border border-black text-black"
              variant="outline"
              size="sm"
            >
              Approve
            </Button>
            <Button
              className="border border-red-500 text-red-500"
              variant="outline"
              size="sm"
            >
              Reject
            </Button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-3 flex flex-col xl:flex-row justify-between gap-2">
          <div className="flex flex-col gap-1">
            <p className="text-sm xl:text-base font-semibold">
              Employee Name - Employee Code
            </p>
            <p className="text-xs xl:text-sm font-medium">
              Request description
            </p>
          </div>
          <div className="flex xl:flex-col gap-1 xl:items-end">
            <Button
              className="border border-black text-black"
              variant="outline"
              size="sm"
            >
              Approve
            </Button>
            <Button
              className="border border-red-500 text-red-500"
              variant="outline"
              size="sm"
            >
              Reject
            </Button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-xl p-3 flex flex-col xl:flex-row justify-between gap-2">
          <div className="flex flex-col gap-1">
            <p className="text-sm xl:text-base font-semibold">
              Employee Name - Employee Code
            </p>
            <p className="text-xs xl:text-sm font-medium">
              Request description
            </p>
          </div>
          <div className="flex xl:flex-col gap-1 xl:items-end">
            <Button
              className="border border-black text-black"
              variant="outline"
              size="sm"
            >
              Approve
            </Button>
            <Button
              className="border border-red-500 text-red-500"
              variant="outline"
              size="sm"
            >
              Reject
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
