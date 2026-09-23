import Employee from "@/models/Employee";

export function findEmployeeByCode(input: string) {
  const code = input.trim().toUpperCase();
  const numericCode = code.replace(/\D/g, "").replace(/^0+/, "");

  return Employee.findOne({
    $or: [
      { employeeCode: code },
      { employeeCode: { $regex: `/${code}$`, $options: "i" } },
      ...(numericCode
        ? [
            {
              employeeCode: {
                $regex: `/0*${numericCode}$`,
                $options: "i",
              },
            },
          ]
        : []),
    ],
  });
}
