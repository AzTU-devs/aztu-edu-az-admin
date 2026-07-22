import { Link } from "react-router";
import Swal from "sweetalert2";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { useEffect, useState } from "react";

import { getImageUrl } from "../../util/imageUrl";
import { reorderAboutPeople, type AboutPerson } from "../../services/about/aboutService";

/**
 * People rendered the way the public site renders them: a grid of cards that
 * open a full detail screen.
 *
 * The vice-rector page is the reason this exists — on aztu.edu.az each card
 * links to its own page carrying the biography, contact block and education
 * history. Editing that through a row in a list misrepresented the structure,
 * so the dashboard mirrors it instead.
 */

interface AboutPeopleCardsProps {
  pageKey: string;
  sectionId: number;
  people: AboutPerson[];
  onChanged: () => void;
}

function SortableCard({ id, children }: { id: number; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className="relative"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        title="Sıralamaq üçün sürükləyin"
        className="absolute right-2 top-2 z-10 cursor-grab rounded-md p-1 text-gray-300 hover:text-gray-500 active:cursor-grabbing dark:text-gray-600 dark:hover:text-gray-400"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <circle cx="7" cy="4" r="1.4" />
          <circle cx="13" cy="4" r="1.4" />
          <circle cx="7" cy="10" r="1.4" />
          <circle cx="13" cy="10" r="1.4" />
          <circle cx="7" cy="16" r="1.4" />
          <circle cx="13" cy="16" r="1.4" />
        </svg>
      </button>
      {children}
    </div>
  );
}

export default function AboutPeopleCards({
  pageKey,
  sectionId,
  people,
  onChanged,
}: AboutPeopleCardsProps) {
  const [order, setOrder] = useState<number[]>(() => people.map((person) => person.id));

  // `people` arrives as a freshly-mapped array each render, so compare the id
  // sequence rather than array identity or this setState re-triggers forever.
  const signature = people.map((person) => person.id).join(",");
  useEffect(() => {
    setOrder(signature === "" ? [] : signature.split(",").map(Number));
  }, [signature]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = order.indexOf(active.id as number);
    const newIndex = order.indexOf(over.id as number);
    if (oldIndex < 0 || newIndex < 0) return;

    const next = arrayMove(order, oldIndex, newIndex);
    setOrder(next);

    const result = await reorderAboutPeople(sectionId, next);
    if (result !== "SUCCESS") {
      setOrder(people.map((person) => person.id));
      Swal.fire({ icon: "error", title: "Xəta", text: "Sıralama yadda saxlanmadı." });
      return;
    }
    onChanged();
  };

  const sorted = [...people].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-100">Şəxslər</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Karta klikləyin — bütün detallar ayrıca səhifədə açılır. Sıralamaq üçün sürükləyin.
          </p>
        </div>
        <Link
          to={`/about-pages/${pageKey}/people/new?section=${sectionId}`}
          className="shrink-0 rounded-lg bg-brand-500 px-4 py-3 text-sm text-white transition hover:bg-brand-600"
        >
          + Şəxs əlavə et
        </Link>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Hələ şəxs əlavə edilməyib.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sorted.map((person) => person.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {sorted.map((person) => {
                const name = person.az?.full_name || person.en?.full_name || "(adsız)";
                const position = person.az?.position || person.en?.position || "";
                const hasDetail = Boolean(person.slug);

                return (
                  <SortableCard key={person.id} id={person.id}>
                    <Link
                      to={`/about-pages/${pageKey}/people/${person.id}`}
                      className="group flex h-full flex-col items-center rounded-2xl border border-gray-200 p-5 text-center transition hover:border-brand-300 hover:shadow-md dark:border-gray-700 dark:hover:border-brand-500/50"
                    >
                      {person.image_url ? (
                        <img
                          src={getImageUrl(person.image_url)}
                          alt=""
                          className="mb-3 h-20 w-20 rounded-full border border-gray-200 object-cover dark:border-gray-700"
                        />
                      ) : (
                        <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-xs text-gray-400 dark:bg-gray-800">
                          Şəkil yoxdur
                        </div>
                      )}

                      <p className="font-semibold text-gray-800 group-hover:text-brand-500 dark:text-gray-100">
                        {name}
                      </p>
                      {position ? (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{position}</p>
                      ) : null}

                      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                        {hasDetail ? (
                          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-medium text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                            Detal səhifəsi
                          </span>
                        ) : null}
                        {!person.is_active ? (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            Gizli
                          </span>
                        ) : null}
                      </div>
                    </Link>
                  </SortableCard>
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
