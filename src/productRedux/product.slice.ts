import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import type { PayloadAction } from "@reduxjs/toolkit";
import { Products } from "../modals/typs";

type ProductState = {
  cache: Record<string, { data: Products[]; hasMore: boolean }>;
  products: Products[]
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  toBeReplacedIndex?: number | null;
  isProdPickerModal?: boolean;
};

const initialState: ProductState = {
  cache: {},
  products: [],
  loading: false,
  error: null,
  hasMore: true,
  toBeReplacedIndex: null,
  isProdPickerModal: false
};

export const fetchProduct = createAsyncThunk(
  "products/fetchProducts",
  async (
    { page, query }: { page: number; query: string },
    {rejectWithValue }
  ) => {

    try {
      const res = await fetch(
        `https://stageapi.monkcommerce.app/task/products/search?search=${query}&page=${page}&limit=10`,
        {
          headers: {
            "x-api-key": "72njgfa948d9aS7gs5",
          },
        }
      );
      if (!res.ok) throw new Error("failed to fetch products");
      const data: Products[] = await res.json();
      return { data, page, query };
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    resetCache(state) {
      state.cache = {};
      state.error = null;
    },
    setToBeReplacedIndex(state,action){
      state.toBeReplacedIndex = action.payload;
    },
    setIsProdPickerModal(state, action){
      state.isProdPickerModal = action.payload
    }

  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.loading = false;
        const {data, query} = action.payload;
        if(query.trim() !== ''){
          state.products = data;
          state.hasMore = data.length === 10;
        }else{
          state.products = [...state.products, ...data];
          state.hasMore = data.length === 10;
        }
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "failed to fetch the product";
      });
  },
});

export const {resetCache, setToBeReplacedIndex, setIsProdPickerModal} = productsSlice.actions;
export default productsSlice.reducer;
