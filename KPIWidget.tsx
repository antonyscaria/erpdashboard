type Props = {
  title: string;
  value: string;
};

export default function KPIWidget({
  title,
  value,
}: Props) {
  return (
    <div className="bg-white rounded-xl border p-5">

      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <h2 className="mt-2 text-2xl font-bold">
        {value}
      </h2>

    </div>
  );
}