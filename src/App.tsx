import { Toaster } from "@/components/ui/sonner";
import { useRoute } from "@/lib/router";
import { AdminSpace } from "@/views/admin";
import { CoachSpace } from "@/views/coach";
import { HomePage } from "@/views/home";
import { SalleSpace } from "@/views/salle";

export default function App() {
  const [space, ...rest] = useRoute();
  return (
    <>
      {space === "salle" ? <SalleSpace route={rest} /> : space === "coach" ? <CoachSpace route={rest} /> : space === "admin" ? <AdminSpace route={rest} /> : <HomePage />}
      <Toaster position="top-center" />
    </>
  );
}
