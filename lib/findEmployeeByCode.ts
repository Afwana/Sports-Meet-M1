import Employee from "@/models/Employee";

export function findEmployeeByCode(input: string) {
  const code = input.trim().toUpperCase();
  const numericCode = code.replace(/\D/g, "").replace(/^0+/, "");

  return Employee.findOne({
    $or: [
      { employeeCode: code }, // MB/CN/0947
      { employeeCode: { $regex: `/${code}$`, $options: "i" } }, // 0947
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
