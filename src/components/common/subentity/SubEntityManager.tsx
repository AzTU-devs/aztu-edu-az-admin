import EntityManager, { CreateResult, MutateResult } from "./EntityManager";
import PersonForm, { PersonFormValue, emptyPersonValue } from "./PersonForm";

export type { CreateResult, MutateResult };

interface SubEntityManagerProps<T> {
  title: string;
  description?: string;
  items: T[];
  getId: (item: T) => number;
  toFormValue: (item: T) => PersonFormValue;
  /** Display helpers for the list rows. */
  getName: (item: T) => string;
  getSubtitle?: (item: T) => string;
  getImage?: (item: T) => string | undefined;
  showImage?: boolean;
  onCreate: (value: PersonFormValue) => Promise<CreateResult>;
  onUpdate: (id: number, value: PersonFormValue) => Promise<MutateResult>;
  onDelete: (id: number) => Promise<MutateResult>;
  onUploadImage?: (id: number, file: File) => Promise<unknown>;
  /** Called after any successful mutation so the parent can refetch. */
  onChanged: () => void;
}

/** People-shaped specialisation of `EntityManager`. */
export default function SubEntityManager<T>({
  title,
  description,
  items,
  getId,
  toFormValue,
  getName,
  getSubtitle,
  getImage,
  showImage = true,
  onCreate,
  onUpdate,
  onDelete,
  onUploadImage,
  onChanged,
}: SubEntityManagerProps<T>) {
  return (
    <EntityManager<T, PersonFormValue>
      title={title}
      description={description}
      items={items}
      getId={getId}
      getPrimary={getName}
      getSecondary={getSubtitle}
      getThumb={getImage}
      showThumb={showImage}
      toFormValue={toFormValue}
      emptyValue={emptyPersonValue}
      validate={(value) =>
        value.first_name.trim() === "" || value.last_name.trim() === "" ? "Ad və soyad tələb olunur." : null
      }
      renderForm={(value, onChange, helpers) => (
        <PersonForm
          value={value}
          onChange={onChange}
          showImage={showImage}
          onImageSelect={helpers.setImageFile}
          selectedImageName={helpers.imageFile?.name}
        />
      )}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onUploadImage={onUploadImage}
      onChanged={onChanged}
    />
  );
}
