import Badge from "../ui/Badge";

const statusConfig = {
  pending:    { variant: "warning",  label: "Pending",      dot: true },
  confirmed:  { variant: "info",     label: "Confirmed",    dot: true },
  preparing:  { variant: "purple",   label: "Preparing",    dot: true },
  on_the_way: { variant: "primary",  label: "On the Way",   dot: true },
  delivered:  { variant: "success",  label: "Delivered",    dot: true },
  cancelled:  { variant: "danger",   label: "Cancelled",    dot: true },
};

const OrderStatusBadge = ({ status }) => {
  const config = statusConfig[status] || { variant: "default", label: status };
  return <Badge variant={config.variant} dot={config.dot}>{config.label}</Badge>;
};

export default OrderStatusBadge;
