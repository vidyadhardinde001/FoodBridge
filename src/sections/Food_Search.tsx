"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import SearchInput from "./SearchInput";
import ProductList from "./ProductList";
import ProductDetails from "./ProductDetails";
import DetailedInfo from "./DetailedInfo";
import NutritionalChart from "./NutritionalChart";
import SkeletonLoader from "./SkeletonLoader";
import { healthRules } from "@/lib/healthRules";
import { 
  findSubstitutes,
  getProductCategory,
  hasAllergens,
  isWidelyAvailable,
  isNutritionallyBetter
} from "@/lib/substituteFinder";

const FoodSearch: React.FC = () => {
  const [barcode, setBarcode] = useState<string>("");
  const [productName, setProductName] = useState<string>("");
  const [foodDataList, setFoodDataList] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [healthEffects, setHealthEffects] = useState<{ [key: string]: any }>({});
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [substitutes, setSubstitutes] = useState<any[]>([]);
  const [substituteLoading, setSubstituteLoading] = useState(false);
  const [healthData, setHealthData] = useState<{ 
    healthIssues: string[], 
    allergies: string[] 
  }>({ healthIssues: [], allergies: [] });

  useEffect(() => {
    const userHealthData = JSON.parse(localStorage.getItem("userHealthData") || "{}");
    setHealthData({
      healthIssues: userHealthData.healthIssues || [],
      allergies: userHealthData.allergies || []
    });
  }, [selectedProduct]);

  const handleFindSubstitutes = async (originalProduct: any) => {
    setSubstituteLoading(true);
    try {
      const substitutes = await findSubstitutes(originalProduct, healthData);
      setSubstitutes(substitutes);
    } catch (error) {
      console.error("Substitute search failed:", error);
    }
    setSubstituteLoading(false);
  };

  const handleProductSelect = (product: any) => {
    setSelectedProduct(product);
    handleFindSubstitutes(product);
  };

  const nutritionixAppId = "c0441bfe"; // Replace with your Nutritionix App ID
  const nutritionixAppKey = "b477432b23b0dc73554fdb61c3f50296"; // Replace with your Nutritionix API Key

  const fetchFoodByBarcode = async () => {
    setLoading(true);
    setSelectedProduct(null);
    setError("");
    try {
      const response = await axios.get(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      if (response.data.status === 1 && response.data.product) {
        const product = response.data.product;
        setSelectedProduct(product);
        handleFindSubstitutes(product);
      } else {
        setError("Product not found.");
      }
    } catch {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFoodByName = async () => {
    setLoading(true);
    setFoodDataList([]);
    setSelectedProduct(null);
    setError("");
    try {
      const response = await axios.get(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${productName}&search_simple=1&json=1`
      );
      if (response.data.products && response.data.products.length > 0) {
        setFoodDataList(response.data.products);
      } else {
        setError("No products found.");
      }
    } catch {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHealthEffects = async (ingredient: string) => {
    const url = `https://trackapi.nutritionix.com/v2/natural/nutrients`;

    try {
      const response = await axios.post(
        url,
        { query: ingredient },
        {
          headers: {
            "x-app-id": nutritionixAppId,
            "x-app-key": nutritionixAppKey,
          },
        }
      );
      if (response.data.foods && response.data.foods.length > 0) {
        return response.data.foods[0];
      }
      return null;
    } catch (error) {
      console.error("Error fetching health effects:", error);
      return null;
    }
  };

  const handleProductSelect = async (product: any) => {
    setSelectedProduct(product);
    setLoading(true);
    setError("");

    if (product.ingredients) {
      const effects: { [key: string]: any } = {};
      for (const ingredient of product.ingredients) {
        const effect = await fetchHealthEffects(ingredient.text);
        if (effect) {
          effects[ingredient.text] = effect;
        }
      }
      setHealthEffects(effects);
    }

    setLoading(false);
  };

  return (
    <div className="w-[98%] mx-auto mt-6 px-4">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6">
        <div className="flex flex-col gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <SearchInput
              barcode={barcode}
              setBarcode={setBarcode}
              productName={productName}
              setProductName={setProductName}
              fetchFoodByBarcode={fetchFoodByBarcode}
              fetchFoodByName={fetchFoodByName}
            />
          </div>

          <div className="bg-gray-800 p-4 rounded-lg flex-1">
            {loading ? (
              <SkeletonLoader type="list" />
            ) : (
              <ProductList
                foodDataList={foodDataList}
                setSelectedProduct={handleProductSelect}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-lg">
            {loading ? (
              <SkeletonLoader type="details" />
            ) : (
              selectedProduct && <ProductDetails selectedProduct={selectedProduct} />
            )}
          </div>

          {selectedProduct && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 p-6 rounded-xl shadow-lg w-full col-span-2 flex flex-col items-center">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Nutritional Chart
                </h2>
                <NutritionalChart
                  labels={[
                    "Energy (kcal)",
                    "Carbs (g)",
                    "Fat (g)",
                    "Sugars (g)",
                    "Salt (g)",
                    "Fibre (g)",
                    "Proteins (g)",
                  ]}
                  values={[
                    selectedProduct.nutriments?.energy_100g / 100 || 0,
                    selectedProduct.nutriments?.carbohydrates_100g || 0,
                    selectedProduct.nutriments?.fat_100g || 0,
                    selectedProduct.nutriments?.sugars_100g || 0,
                    selectedProduct.nutriments?.salt_100g || 0,
                    selectedProduct.nutriments?.fibre_100g || 0,
                    selectedProduct.nutriments?.proteins_100g || 0,
                  ]}
                  label="Nutrition Per 100g"
                />
              </div>
            </div>
          )}

          {selectedProduct && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <DetailedInfo selectedProduct={selectedProduct} />
            </div>
          )}

          {selectedProduct && (
            <div className="bg-gray-800 p-4 rounded-lg mt-4">
              <h2 className="text-lg font-semibold text-white mb-4">Ingredient Health Effects</h2>
              {selectedProduct.ingredients ? (
                <ul className="space-y-2">
                  {selectedProduct.ingredients.map((ingredient: any, index: number) => (
                    <li key={index} className="text-white">
                      <strong>{ingredient.text}:</strong>{" "}
                      {healthEffects[ingredient.text] ? (
                        <span>
                          Calories: {healthEffects[ingredient.text].nf_calories} kcal,{" "}
                          Protein: {healthEffects[ingredient.text].nf_protein} g,{" "}
                          Fat: {healthEffects[ingredient.text].nf_total_fat} g
                        </span>
                      ) : (
                        "No health effects data available."
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-white">No ingredients listed.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Substitute products section */}
      {substitutes.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-4">Healthier Alternatives</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {substitutes.map((substitute) => (
              <div key={substitute.code} className="bg-gray-800 p-4 rounded-lg">
                <img
                  src={substitute.image_url}
                  alt={substitute.product_name}
                  className="w-full h-48 object-contain mb-4"
                />
                <h3 className="text-lg font-semibold text-white">
                  {substitute.product_name || "Unnamed Product"}
                </h3>
                <div className="flex flex-wrap gap-2 my-2">
                  <span className="px-2 py-1 bg-blue-600 rounded-full text-xs">
                    {substitute.nutriscore_grade?.toUpperCase() || 'N/A'} NutriScore
                  </span>
                  <span className="px-2 py-1 bg-green-600 rounded-full text-xs">
                    {substitute.ecoscore_grade?.toUpperCase() || 'N/A'} EcoScore
                  </span>
                </div>
                <button
                  onClick={() => handleProductSelect(substitute)}
                  className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {substituteLoading && (
        <div className="text-center mt-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-purple-500 mt-2">Finding healthier alternatives...</p>
        </div>
      )}

      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
  );
};

export default FoodSearch;
