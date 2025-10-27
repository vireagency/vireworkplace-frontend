import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { adminDashboardConfig } from "@/config/dashboardConfigs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IconSearch,
  IconPlus,
  IconFileText,
  IconEdit,
  IconTrash,
  IconAlertTriangle,
  IconPackage,
  IconTrendingDown,
  IconCalendar,
  IconDotsVertical,
} from "@tabler/icons-react";

export default function AdminInventoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [inventoryItems, setInventoryItems] = useState([
    {
      id: 1,
      name: "Dell OptiPlex 7090",
      sku: "DEL-OPT-7090",
      quantity: 15,
      category: "Electronics",
      status: "Normal",
      isLowStock: false,
    },
    {
      id: 2,
      name: "Office Chair Ergonomic",
      sku: "CHAIR-ERG-001",
      quantity: 3,
      category: "Furniture",
      status: "Low Stock",
      isLowStock: true,
    },
    {
      id: 3,
      name: "Wireless Mouse Logitech",
      sku: "LOG-MS-WL",
      quantity: 45,
      category: "Electronics",
      status: "In Stock",
      isLowStock: false,
    },
    {
      id: 4,
      name: "Printer Paper A4",
      sku: "PPR-A4-500",
      quantity: 2,
      category: "Supplies",
      status: "Low Stock",
      isLowStock: true,
    },
    {
      id: 5,
      name: "Whiteboard Markers Set",
      sku: "WB-MRK-SET",
      quantity: 1,
      category: "Supplies",
      status: "Low Stock",
      isLowStock: true,
    },
    {
      id: 6,
      name: "Conference Table Round",
      sku: "TBL-CONF-RND",
      quantity: 3,
      category: "Furniture",
      status: "Low Stock",
      isLowStock: true,
    },
    {
      id: 7,
      name: "Standing Desk Adjustable",
      sku: "DESK-STD-ADJ",
      quantity: 45,
      category: "Furniture",
      status: "In Stock",
      isLowStock: false,
    },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Calculate overview statistics
  const totalItems = inventoryItems.length;
  const lowStockItems = inventoryItems.filter((item) => item.isLowStock).length;
  const currentMonth = new Date().toLocaleString("default", { month: "long" });

  // Filter items based on search term
  const filteredItems = inventoryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800 border-green-200";
      case "Low Stock":
        return "bg-red-100 text-red-800 border-red-200";
      case "Normal":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get category badge styling
  const getCategoryBadge = (category) => {
    switch (category) {
      case "Electronics":
        return "bg-blue-100 text-blue-800";
      case "Furniture":
        return "bg-purple-100 text-purple-800";
      case "Supplies":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle delete item
  const handleDeleteItem = (itemId) => {
    setInventoryItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Handle edit item
  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  return (
    <DashboardLayout
      sidebarConfig={adminDashboardConfig}
      showSectionCards={false}
      showChart={false}
      showDataTable={false}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="px-6 py-6 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Inventory Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your office inventory and track stock levels
              </p>
            </div>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Items Card */}
            <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <IconPackage className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Items
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {totalItems}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Low Stock Card */}
            <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                    <IconTrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Low Stock
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {lowStockItems}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inventory for Month Card */}
            <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                    <IconCalendar className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Inventory for Month
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {currentMonth}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Inventory Table */}
          <Card className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <CardHeader className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search items or SKU..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <IconFileText className="w-4 h-4 mr-2" />
                    Reports
                  </Button>
                  <Dialog
                    open={isAddModalOpen}
                    onOpenChange={setIsAddModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-green-500 hover:bg-green-600 text-white">
                        <IconPlus className="w-4 h-4 mr-2" />
                        Add New Item
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New Inventory Item</DialogTitle>
                        <DialogDescription>
                          Add a new item to your inventory management system.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Item Name
                          </label>
                          <Input
                            placeholder="Enter item name"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            SKU
                          </label>
                          <Input placeholder="Enter SKU" className="mt-1" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Quantity
                          </label>
                          <Input
                            type="number"
                            placeholder="Enter quantity"
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Category
                          </label>
                          <Input
                            placeholder="Enter category"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 mt-6">
                        <Button
                          variant="outline"
                          onClick={() => setIsAddModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => setIsAddModalOpen(false)}
                        >
                          Add Item
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SKU
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-gray-700">
                                {item.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.sku}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm text-gray-900 mr-2">
                              {item.quantity}
                            </span>
                            {item.isLowStock && (
                              <IconAlertTriangle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={`text-xs ${getCategoryBadge(
                              item.category
                            )}`}
                          >
                            {item.category}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            className={`text-xs border ${getStatusBadge(
                              item.status
                            )}`}
                          >
                            {item.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditItem(item)}
                              className="text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <IconEdit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <IconTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Item Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Inventory Item</DialogTitle>
              <DialogDescription>
                Update the details of this inventory item.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Item Name
                </label>
                <Input
                  defaultValue={editingItem?.name}
                  placeholder="Enter item name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">SKU</label>
                <Input
                  defaultValue={editingItem?.sku}
                  placeholder="Enter SKU"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <Input
                  type="number"
                  defaultValue={editingItem?.quantity}
                  placeholder="Enter quantity"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <Input
                  defaultValue={editingItem?.category}
                  placeholder="Enter category"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={() => setIsEditModalOpen(false)}
              >
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
