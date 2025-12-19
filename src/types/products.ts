type ProductAttribute = {
    name: string;
    value: string;
};

export type Products = {
    id: number;
    key: string;
    product_id: string;
    name: string;
    attribute: ProductAttribute[];
    description: string;
    price: string;
    category: string;
    stock: string;
    unit: string;
};

export interface ProductApiResponse {
    success: boolean;
    data: Products[];
    message?: string;
}

export interface ProductsTableProps {
    products: Products[];
    fetchProducts: () => void;
    loading: boolean;
}

export interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentProduct: Products | null;
    onSave: (updatedProduct: Products) => Promise<void>;
}

export interface ProductsReportButtonProps {
    products: Products[];
}

