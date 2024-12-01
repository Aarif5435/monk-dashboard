import { useState } from "react";
import { RxCross2, RxDragHandleDots2 } from "react-icons/rx";
import { SelectedProduct } from "./selectedProduct";
import { IoChevronDownSharp } from "react-icons/io5";
import { MdModeEdit } from "react-icons/md";
import { Image, Products } from "../modals/typs";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../productRedux/store";
import {
  setToBeReplacedIndex,
  setIsProdPickerModal,
} from "../productRedux/product.slice";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

export const ProductListComp = () => {
  const { isProdPickerModal } = useSelector(
    (state: RootState) => state.products
  );
  const dispatch = useDispatch<AppDispatch>();

  const [selectedProductList, setSelectedProductList] = useState<Products[]>([
    {
      id: 1,
      title: "",
      variants: [],
      image: {} as Image,
      isDiscount: false,
      isVariant: false,
    },
  ]);

  const handleAddProduct = () => {
    const addedProduct = {
      id: 2,
      title: "",
      variants: [],
      image: {} as Image,
      isDiscount: false,
      isVariant: false,
    };
    setSelectedProductList((prev): Products[] => [...prev, addedProduct]);
  };

  const handleOnDragEnd = (result: any) => {
    const { source, destination } = result;
    if (!destination) return; // Drop outside the list

    // Reordering main product list
    if (result.type === "PRODUCTS") {
      const reorderedList = Array.from(selectedProductList);
      const [movedItem] = reorderedList.splice(source.index, 1);
      reorderedList.splice(destination.index, 0, movedItem);
      setSelectedProductList(reorderedList);
    }

    // Reordering variants within a specific product
    if (result.type.startsWith("VARIANTS")) {
      const productIndex = parseInt(result.type.split("-")[1]);
      const product = selectedProductList[productIndex];

      const updatedVariants = Array.from(product.variants);
      const [movedVariant] = updatedVariants.splice(source.index, 1);
      updatedVariants.splice(destination.index, 0, movedVariant);

      setSelectedProductList((prev) =>
        prev.map((prod, index) =>
          index === productIndex ? { ...prod, variants: updatedVariants } : prod
        )
      );
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <div className="flex flex-col mt-auto">
          <h1 className="text-lg font-semibold mb-5 float-start flex align-baseline">
            Add Products
          </h1>
          <Droppable droppableId="products-list" type="PRODUCTS">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {selectedProductList.map((val, ind) => (
                  <Draggable key={ind} draggableId={`${ind}`} index={ind}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className="mb-8"
                      >
                        <div className="flex gap-2 text-sm font-medium">
                          <div className="flex flex-col items-start">
                            {ind === 0 && (
                              <label className="mb-2 px-8 py-1">Product</label>
                            )}
                            <div className="relative flex items-center gap-2">
                              <div {...provided.dragHandleProps}>
                                <RxDragHandleDots2
                                  size={20}
                                  className="w-5 text-gray-500 cursor-move"
                                />
                              </div>
                              <label>{ind + 1}.</label>
                              <input
                                type="text"
                                placeholder="Select Product"
                                value={val.title}
                                className="w-full border border-gray-300 shadow-lg px-4 py-2 pr-10 bg-white text-gray-500 focus:outline-none focus:ring-0 focus:ring-gray-300"
                                readOnly
                              />
                              <MdModeEdit
                                onClick={() => {
                                  dispatch(setToBeReplacedIndex(ind));
                                  dispatch(setIsProdPickerModal(true));
                                }}
                                size={20}
                                className="absolute text-gray-500 top-1/4 right-3 cursor-pointer"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col items-start">
                            {ind === 0 && (
                              <label className="mb-2 px-4 py-1">Discount</label>
                            )}
                            <div>
                              {!val?.isDiscount ? (
                                <button
                                  onClick={() =>
                                    setSelectedProductList((prev) =>
                                      prev.map((product, index) =>
                                        index === ind
                                          ? { ...product, isDiscount: true }
                                          : product
                                      )
                                    )
                                  }
                                  className="border cursor-pointer p-2 text-white rounded bg-[#008060]"
                                >
                                  Add Discount
                                </button>
                              ) : (
                                <div>
                                  <div className="w-44 flex gap-1">
                                    <input
                                      className="w-full border border-gray-300 shadow-lg p-2 bg-white text-gray-500 focus:outline-none focus:ring-0 focus:ring-gray-300"
                                      type="number"
                                      placeholder="0"
                                    />
                                    <select className="w-full border border-gray-300 shadow-lg p-2 bg-white text-gray-500 focus:outline-none focus:ring-0 focus:ring-gray-300">
                                      <option
                                        className="bg-white"
                                        value="percent"
                                      >
                                        % Off
                                      </option>
                                      <option value="flat">Flat Off</option>
                                    </select>
                                  </div>
                                  {val.variants.length > 0 && (
                                    <button
                                      onClick={() =>
                                        setSelectedProductList((prev) =>
                                          prev.map((product, index) =>
                                            index === ind
                                              ? {
                                                  ...product,
                                                  isVariant: !val?.isVariant,
                                                }
                                              : product
                                          )
                                        )
                                      }
                                      className="text-blue-500 cursor-pointer underline mt-2 flex items-center gap-1 float-end"
                                    >
                                      {val?.isVariant ? "Hide" : "Show"}{" "}
                                      variants{" "}
                                      <IoChevronDownSharp
                                        className={`${
                                          val?.isVariant && "rotate-[180deg]"
                                        }`}
                                      />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          {selectedProductList.length !== 1 && (
                           <div
                           className={`${
                             ind === 0
                               ? "mt-8"
                               : val.variants.length > 0
                               ? "-mt-8"
                               : ""
                           } flex items-center cursor-pointer`}
                         >
                              <RxCross2
                                onClick={() => {
                                  setSelectedProductList((prev) =>
                                    prev.filter((_, index) => index !== ind)
                                  );
                                }}
                                size={25}
                                className="text-gray-500"
                              />
                            </div>
                          )}
                        </div>
                        {/* Variants */}
                        {val?.isVariant && (
                          <Droppable
                            droppableId={`variants-${ind}`}
                            type={`VARIANTS-${ind}`}
                          >
                            {(provided) => (
                              <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="mt-5"
                              >
                                {val.variants.map((variant, index) => (
                                  <Draggable
                                    key={index}
                                    draggableId={`variant-${ind}-${index}`}
                                    index={index}
                                  >
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="flex items-center justify-end gap-2 mt-5 0 p-2 rounded"
                                      >
                                        <RxDragHandleDots2
                                          size={18}
                                          className="w-5 text-gray-500 cursor-move"
                                        />
                                        <label>{index + 1}.</label>
                                        <input
                                          type="text"
                                          placeholder="Select Product"
                                          value={variant.title}
                                          className="w-2/5 text-sm rounded-3xl border border-gray-300 shadow-lg px-2 py-1 pr-10 bg-white text-gray-500 focus:outline-none focus:ring-0 focus:ring-gray-300"
                                          readOnly
                                        />
                                        <div className="w-44 flex gap-2">
                                          <input
                                            className="w-full text-sm rounded-3xl border border-gray-300 shadow-lg p-1 text-center bg-white text-gray-500 focus:outline-none focus:ring-0 focus:ring-gray-300"
                                            type="number"
                                            placeholder="0"
                                          />
                                          <select className="w-full text-sm rounded-3xl border border-gray-300 shadow-lg p-2 bg-white text-gray-500 focus:outline-none focus:ring-0 focus:ring-gray-300">
                                            <option
                                              className="bg-white"
                                              value="percent"
                                            >
                                              % Off
                                            </option>
                                            <option value="flat">
                                              Flat Off
                                            </option>
                                          </select>
                                        </div>
                                        <div
                                          className={`flex items-center cursor-pointer`}
                                        >
                                          <RxCross2
                                            onClick={() => {
                                              setSelectedProductList((pre) => {
                                                const updatedList = pre.map(
                                                  (p) =>
                                                    val.id === p.id
                                                      ? {
                                                          ...p,
                                                          variants:
                                                            p.variants.filter(
                                                              (_, idx) =>
                                                                idx !== index
                                                            ),
                                                        }
                                                      : p
                                                );
                                                return updatedList;
                                              });
                                            }}
                                            size={25}
                                            className="text-gray-500"
                                          />
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                              </div>
                            )}
                          </Droppable>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          {
            <div className="flex justify-end">
              <button
                onClick={handleAddProduct}
                className="border-2 cursor-pointer text-[#276858] text-sm font-semibold p-3 w-48 rounded border-[#008060]"
              >
                Add Product
              </button>
            </div>
          }
        </div>
      </DragDropContext>

      {isProdPickerModal && (
        <SelectedProduct
          setSelectedProductList={setSelectedProductList}
          selectedProductList={selectedProductList}
        />
      )}
    </>
  );
};
