import { RxCross2 } from "react-icons/rx";
import { IoIosSearch } from "react-icons/io";
import { debounce } from "lodash";
import { Products, Variants } from "../modals/typs";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../productRedux/store";
import { fetchProduct, setIsProdPickerModal } from "../productRedux/product.slice";
import LoadingSpinner from "./loading";

export const SelectedProduct = ({
  setSelectedProductList,
  selectedProductList,
}: {
  setSelectedProductList: (
    val: Products[] | ((prev: Products[]) => Products[])
  ) => void;
  selectedProductList: Products[];
}) => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  const { products, hasMore, loading, error, toBeReplacedIndex } = useSelector((state: RootState) => state.products);
  const [newSelectedProductList, setNewSelectedProductList] = useState<Products[]>([])

  const replaceIndexWithValues = (array: Products[], index: number | null | undefined, newValues: Products[]) => {
    const updatedArray = JSON.parse(JSON.stringify(array));

    if(index === 0)
      updatedArray[0] = newValues[0]
    
    if(index)
    updatedArray.splice(index, 1, ...newValues);
  
    setSelectedProductList(updatedArray)
    dispatch(setIsProdPickerModal(false))
  };

  const handleProductSelection = ({
    product,
    event,
  }: {
    product: Products;
    event: any;
  }) => {

    if (event.target.checked) {
      setNewSelectedProductList((prev) => {
        const productExist = prev.find((p) => p.id === product.id);
        if (!productExist)
          return [
            ...prev,
            {
              ...product,
              isProdSelected: true,
              variants: product.variants.map((vari) => ({
                ...vari,
                isVariantSelected: true,
              })),
            },
          ]

          const updatedList = prev.map((p) =>
            p.id === product.id
              ? {
                  ...p,
                  isProdSelected: true,
                  variants: p.variants.map((vari) => ({
                    ...vari,
                    isVariantSelected: true,
                  })),
                }
              : p
          );
        
          return updatedList;
      });
    } else if (!event.target.checked) {
      const updatedList = selectedProductList.map((val) => {
        if (val.id === product.id) {
          return {
            ...val,
            isProdSelected: false,
            variants: val.variants.map((vari) => ({
              ...vari,
              isVariantSelected: false,
            })),
          };
        }
        return val;
      });
    
      const filteredList = updatedList.filter((p) => p.id !== product.id);
    
      setNewSelectedProductList(filteredList);
    }
  };

  const handleVariantSelection = ({
    variant,
    product,
    event,
  }: {
    variant: Variants;
    product: Products;
    event: any;
  }) => {
    if (event.target.checked) {
      setNewSelectedProductList((prev) => {
        const productExist = prev.find((pro) => pro.id === product.id);

        if (productExist) {
          return prev.map((p) =>
            p.id === product.id
              ? {
                  ...p,
                  isProdSelected: true,
                  variants: p.variants.some((v) => v.id === variant.id)
                    ? p.variants
                    : [...p.variants, { ...variant, isVariantSelected: true }],
                }
              : p
          );
        }

        return [
          ...prev,
          {
            ...product,
            isProdSelected: true,
            variants: [{ ...variant, isVariantSelected: true }],
          },
        ];
      });
    } else if (!event.target.checked) {
      setNewSelectedProductList((prev) => {
        return prev.map((p) => {
          return p.id === product.id
            ? {
                ...p,
                // isProdSelected: p.variants.length > 1 ? true : false,
                variants: p.variants
                  .filter((vari) => variant.id !== vari.id)
                  .map((vari) =>
                    vari.id === variant.id
                      ? { ...vari, isVariantSelected: false }
                      : vari
                  ),
              }
            : p;
        });
      });
    }
    console.log(event.target.checked);
  };

  const debouncedSearch = useCallback(
    debounce(({ page, query }: { page: number; query: string }) => {
      dispatch(fetchProduct({ page, query }));
    }, 800),
    [dispatch]
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearch(value);
    debouncedSearch({ page: 1, query: value });
  };

  useEffect(() => {
    if (!search) {
      dispatch(fetchProduct({ page, query: "" }));
    }
  }, [page, search, dispatch]);

  const handleScroll = () => {
    const modalContainer = document.getElementById("modal-scroll-container");
    if (modalContainer) {
      const { scrollTop, scrollHeight, clientHeight } = modalContainer;
 
    
      if (
        scrollHeight - scrollTop <= clientHeight + 200 &&
        !loading &&
        hasMore
      ) {
        console.log("products","products--", scrollHeight - scrollTop <= clientHeight + 200 &&
          !loading &&
          hasMore, page)
        setPage((prevPage) => prevPage + 1);
      }
    }
  };

  useEffect(() => {
    const modalContainer = document.getElementById("modal-scroll-container");
    if (modalContainer) {
      modalContainer.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (modalContainer)
        modalContainer.removeEventListener("scroll", handleScroll);
    };
  }, [loading]);

  if(error) return <div>Something went wrong</div>

  return (
    <>
      <div className="fixed inset-0 z-10 flex items-center justify-center bg-gray-800 bg-opacity-50">
        <div
          id="modal-scroll-container"
          className={`bg-white ${
            products.length > 0 && !loading ? "h-2/3" : "h-fit"
          } w-11/12 max-w-3xl rounded-lg shadow-lg overflow-scroll`}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white">
            <header className="flex items-center justify-between px-7 p-3 border-b border-gray-200">
              <h1 className="text-lg font-semibold">Select Products</h1>
              <button onClick={() => dispatch(setIsProdPickerModal(false))}>
                <RxCross2 size={20} />
              </button>
            </header>
            <div className="p-2 relative flex justify-center border-b">
              <input
                className="p-1 w-[95%] px-9 border focus:outline-none focus:ring-0 text-sm"
                placeholder="Search product"
                onChange={handleSearchChange}
                type="text"
                value={search}
              />
              <span>
                <IoIosSearch
                  className="absolute top-1/3 left-8 text-gray-400"
                  size={17}
                />
              </span>
            </div>
          </div>
          {/* products */}
          {loading ? (
            <div className="flex justify-center items-center">
              <LoadingSpinner />
            </div>
          ) : (
            products.map((product, ind) => {
              const selectProduct = newSelectedProductList.find(
                (prod) => prod?.id === product?.id
              );
              return (
                <div key={ind}>
                  <div className="border-b p-2 flex gap-4 items-center px-4">
                    <input
                      className="accent-[#008060] h-5 w-5"
                      onChange={(event) =>
                        handleProductSelection({ product, event })
                      }
                      type="checkbox"
                      checked={selectProduct?.isProdSelected}
                      name=""
                      id=""
                    />
                    <img
                      width={35}
                      className="rounded border w-8 h-8"
                      src={product.image.src}
                      alt="reactIcon"
                    />
                    <label className="text-base font-normal">
                      {product.title}
                    </label>
                  </div>
                  {/* variables */}
                  {product.variants.map((variant: Variants, index: number) => {
                    const selectVariant = selectProduct?.variants.find(
                      (vari) => vari.id === variant.id
                    );
                    console.log("selectedVariant", selectProduct,
                      selectVariant)
                    return (
                      <div
                        key={index}
                        className="flex justify-between px-14 p-3 border-b"
                      >
                        <label className="flex gap-4 items-center">
                          <input
                            className="accent-[#008060] h-5 w-5"
                            type="checkbox"
                            onChange={(event) => {
                              handleVariantSelection({
                                variant,
                                product,
                                event,
                              });
                            }}
                            checked={
                              selectProduct?.isProdSelected &&
                              selectVariant?.isVariantSelected
                            }

                          />
                          <span className="text-base font-normal">
                            {variant.title}
                          </span>
                        </label>
                        <div className="flex gap-4 text-base font-normal">
                          <span>${variant.price}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        <div className="sticky bottom-0 z-10 bg-white p-3 flex justify-between">
           <label className="text-base">{newSelectedProductList.length} product{newSelectedProductList.length> 1 ? `'s` : ''} selected</label>
           <div className="flex gap-3">
               <button onClick={()=> dispatch(setIsProdPickerModal(false))} className="px-4 w-28 py-1 border border-black rounded text-black font-semibold">Cancel</button>
               <button onClick={()=> replaceIndexWithValues(selectedProductList, toBeReplacedIndex, newSelectedProductList)} className="px-4 w-28 py-1 border border-[#008060] rounded text-white bg-[#008060] font-semibold">Add</button>
           </div>
        </div>
        </div>
      </div>
    </>
  );
};
