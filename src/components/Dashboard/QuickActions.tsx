import Link from "next/link";
import {
  FiDollarSign,
  FiPieChart,
  FiUsers,
  FiPlus,
  FiUserCheck,
} from "react-icons/fi";

type QuickAction = {
  title: string;
  description: string;
  icon: React.ReactNode;
  textColor: string;
  link: string;
  effect: string;
};

export const QuickActions = () => {
  const quickActions: QuickAction[] = [
    {
      title: "Create Invoice",
      description: "Generate new invoices",
      icon: (
        <FiDollarSign
          className="group-hover:scale-110 transition-transform mb-3"
          size={40}
        />
      ),
      textColor: "text-[#32C19C]",
      link: "/invoices/create-invoices",
      effect:
        "bg-emerald-50 border-transparent hover:border-emerald-300",
    },
    {
      title: "Add Customers",
      description: "Create customer profiles",
      icon: (
        <FiUsers
          className="group-hover:scale-110 transition-transform mb-3"
          size={40}
        />
      ),
      textColor: "text-red-500",
      link: "/customers/add-customers",
      effect:
        "bg-red-50 border-transparent hover:border-red-300",
    },
    {
      title: "Add Products",
      description: "Expand your catalog",
      icon: (
        <>
          <FiPieChart
            className="group-hover:scale-110 transition-transform mb-3"
            size={40}
          />
          <FiPlus className="absolute -top-1 -right-1 text-xs bg-white rounded-full p-0.5 border" />
        </>
      ),
      textColor: "text-[#F8C51E]",
      link: "/products/add-products",
      effect:
        "bg-yellow-50 border-transparent hover:border-yellow-300",
    },
    {
      title: "Add Employee",
      description: "Create employee records",
      icon: (
        <FiUserCheck
          className="group-hover:scale-110 transition-transform mb-3"
          size={40}
        />
      ),
      textColor: "text-[#6366F1]",
      link: "/employees/add-employees",
      effect:
        "bg-purple-50 border-transparent hover:border-purple-300",
    },
  ];

  return (
    <section className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-800">
          Quick Actions
        </h2>
        <p className="text-sm text-gray-500 md:block hidden">
          Shortcuts to key functions
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            href={action.link}
            className={`group relative rounded-xl py-6 border transition-all duration-300 ${action.effect} flex flex-col items-center text-center shadow-sm`}
          >
            <div className={`relative rounded-full ${action.textColor}`}>
              {action.icon}
            </div>
            <h3 className={`text-lg font-medium ${action.textColor}`}>
              {action.title}
            </h3>
            <p className="text-sm text-gray-600">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};
