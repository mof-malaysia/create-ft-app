// @if api
import { useQuery } from "@tanstack/react-query";
// @else
import { useState } from "react";
// @endif
import { Button } from "@/components/ui/button";
// @if api
import { Tag } from "@/components/ui/tag";
// @endif
import { t } from "@/i18n";
// @if api
import { api } from "@/lib/api";
// @if contracts
import type { Greeting } from "{{scope}}/contracts";
// @else
type Greeting = { message: string };
// @endif
// @endif

export function HomePage() {
  // @if api
  const health = useQuery({
    queryKey: ["healthz"],
    queryFn: () => api.get("healthz").json<{ ok: boolean }>(),
  });
  const hello = useQuery({
    queryKey: ["hello"],
    queryFn: () =>
      api
        .get("v1/hello", { searchParams: { name: "FTDS" } })
        .json<{ data: Greeting }>(),
  });
  const status = health.isPending
    ? "checking"
    : health.data?.ok
      ? "up"
      : "down";
  // @else
  const [count, setCount] = useState(0);
  // @endif

  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">{t("home.title")}</h1>
      <p className="text-txt-black-700">{t("home.intro")}</p>
      {/* @if api */}
      <div className="flex flex-wrap items-center gap-3">
        <Tag
          variant={
            status === "up"
              ? "success"
              : status === "down"
                ? "danger"
                : "default"
          }
        >
          {t(`home.api.${status}`)}
        </Tag>
        {hello.data && <span>{hello.data.data.message}</span>}
      </div>
      <div>
        <Button onClick={() => void health.refetch()}>
          {t("home.api.recheck")}
        </Button>
      </div>
      {/* @else */}
      <div>
        <Button onClick={() => setCount((c) => c + 1)}>
          {t("home.clicked", { count })}
        </Button>
      </div>
      {/* @endif */}
    </section>
  );
}
