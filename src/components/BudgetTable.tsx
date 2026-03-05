import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const data = [
  { id: "1", category: "Groceries", budget: 400, spent: 320 },
  { id: "2", category: "Dining", budget: 150, spent: 120 },
  { id: "3", category: "Shopping", budget: 200, spent: 240 },
];

export default function BudgetTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Category</TableHead>
          <TableHead>Budget</TableHead>
          <TableHead>Spent</TableHead>
          <TableHead>Remaining</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.map((item) => {
          const remaining = item.budget - item.spent;

          return (
            <TableRow key={item.id}>
              <TableCell>{item.category}</TableCell>
              <TableCell>${item.budget}</TableCell>
              <TableCell>${item.spent}</TableCell>

              <TableCell
                className={
                  remaining < 0
                    ? "text-red-500 font-semibold"
                    : "text-green-600"
                }
              >
                ${remaining}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
