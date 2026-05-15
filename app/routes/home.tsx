import { WelcomePage } from "~/features/welcome";

import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Edu Nexus" },
    { name: "description", content: "Welcome to Edu Nexus" },
  ];
}

export default function Home() {
  return <WelcomePage />;
}
