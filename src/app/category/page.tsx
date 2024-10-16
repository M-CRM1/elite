"use client";
import { useEffect, useState } from "react";
import { MdDragIndicator, MdEdit, MdDelete } from "react-icons/md";
import clsx from "clsx";

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false); // Control form visibility
  const [draggedCategory, setDraggedCategory] = useState<Category | null>(null);
  const [targetCategory, setTargetCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories`
        );
        if (!response.ok) {
          throw new Error("Ошибка при загрузке категорий");
        }
        const data = await response.json();
        setCategories(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const onDragStart = (category: Category) => {
    setDraggedCategory(category);
  };

  const onDragOver = (
    e: React.DragEvent<HTMLLIElement>,
    category: Category
  ) => {
    e.preventDefault(); // Allow the drop
    setTargetCategory(category); // Set the current target category being hovered
  };

  const onDrop = async () => {
    if (draggedCategory && targetCategory) {
      const draggedIndex = categories.findIndex(
        (c) => c.id === draggedCategory.id
      );
      const targetIndex = categories.findIndex(
        (c) => c.id === targetCategory.id
      );

      // Reorder categories array
      const updatedCategories = [...categories];
      updatedCategories.splice(draggedIndex, 1); // Remove dragged item
      updatedCategories.splice(targetIndex, 0, draggedCategory); // Insert dragged item at target position

      setCategories(updatedCategories);
      setDraggedCategory(null); // Clear dragged item
      setTargetCategory(null); // Clear drop target

      // Update sort order in the database
      await updateSortOrder(updatedCategories);
    }
  };

  const handleEdit = (category: Category) => {
    setError("");
    setShowForm(true);
    setEditingCategory(category);
    setNewCategory(category.name); // Pre-fill the input with the current category name
  };

  const handleDelete = async (categoryId: number) => {
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/${categoryId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "Delete failed");
        return;
      }

      // Remove the deleted category from state
      setCategories(
        categories.filter((category) => category.id !== categoryId)
      );
    } catch (err) {
      setError("An error occurred while deleting the category.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const newSortOrder =
      categories.length > 0
        ? Math.max(...categories.map((cat) => cat.sort)) + 1
        : 1; // Calculate the next sort order

    const requestBody = {
      name: newCategory,
      sort: newSortOrder,
    };

    if (editingCategory) {
      // Update the category
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories/${editingCategory.id}`,
          {
            method: "PUT", // Use PUT for updating
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (!response.ok) {
          throw new Error("Ошибка при обновлении категории");
        }

        // Update the state to reflect the edited category
        const updatedCategoryData = await response.json();
        const updatedCategories = categories.map((category) =>
          category.id === editingCategory.id
            ? { ...updatedCategoryData.data }
            : category
        );

        setCategories(updatedCategories);
        setEditingCategory(null); // Reset editing mode
      } catch (err) {
        setError(err.message);
      }
    } else {
      // Add a new category
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
          }
        );

        if (!response.ok) {
          throw new Error("Ошибка при добавлении категории");
        }

        const newCategoryData = await response.json();
        setCategories([...categories, newCategoryData.data]);
      } catch (err) {
        setError(err.message);
      }
    }

    setNewCategory(""); // Clear the input after submission
  };

  const updateSortOrder = async (updatedCategories: Category[]) => {
    setError("");
    try {
      // Create an array of update requests
      const updateRequests = updatedCategories.map((category, index) => {
        return fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories/${category.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ sort: index + 1 }), // Update sort order starting from 1
          }
        );
      });

      // Wait for all requests to complete
      await Promise.all(updateRequests);
    } catch (err) {
      console.error("Error updating sort order:", err);
    }
  };

  return (
    <div
      className="flex flex-col items-center mt-5"
      style={{ padding: "20px" }}
    >
      <h1 className="text-xl font-bold">ДОБАВЛЕНИЕ КАТЕГОРИИ ДЛЯ БАНЕРА</h1>
      {error && <p className="text-red-500">{error}</p>}

      <div className="flex flex-row">
        <div className="flex-1 mr-4">
          <button
            className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
            onClick={() => setShowForm((prev) => !prev)}
          >
            {showForm ? "Oтмена" : "Добавить категорию +"}
          </button>
          {isLoading ? (
            <p>Загрузка категорий...</p>
          ) : (
            <ol className="list-decimal pl-6">
              {categories.length ? (
                categories.map((category, index) => (
                  <li
                    key={category.id}
                    className={clsx(
                      "flex items-center justify-between p-4 mb-2 rounded transition-all duration-300 ease-in-out",
                      draggedCategory?.id === category.id
                        ? "bg-yellow-200 opacity-75"
                        : targetCategory?.id === category.id
                        ? "bg-green-200"
                        : "bg-gray-200"
                    )}
                    draggable
                    onDragStart={() => onDragStart(category)}
                    onDragOver={(e) => onDragOver(e, category)}
                    onDrop={onDrop}
                  >
                    <span className="font-bold">{index + 1}.</span>
                    <span className="flex-1 mx-2">{category.name}</span>
                    <div className="actions flex flex-col items-end">
                      <button className="drag_btn bg-transparent border-none cursor-pointer">
                        <MdDragIndicator />
                      </button>
                      <div className="flex space-x-1 mt-1">
                        <button
                          onClick={() => handleEdit(category)}
                          className="bg-transparent border-none cursor-pointer font-25"
                        >
                          <MdEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="bg-transparent border-none cursor-pointer"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li>no category found</li>
              )}
            </ol>
          )}
        </div>

        <div
          className={`fixed right-0 top-0 h-full bg-white p-5 shadow-lg transition-transform duration-500 ${
            showForm ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <form onSubmit={handleSubmit} className="flex flex-col">
            <h2 className="text-lg font-bold mb-4">
              {editingCategory ? "Изменить категорию" : "Добавить категорию"}
            </h2>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="mb-4 p-2 border border-gray-300 rounded"
              placeholder="Category Name"
              required
            />
            <button
              type="submit"
              className="bg-green-500 text-white py-2 px-4 rounded"
            >
              {editingCategory ? "Изменить" : "Добавить"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Categories;
