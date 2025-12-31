import React, { createContext, useContext, useState } from "react";

interface CoffeeItem {
    name: string;
    subTitle: string;
    price: string;
    image: any;
    rating?: number;
}

interface FavoritesContextType {
    favorites: CoffeeItem[];
    toggleFavorite: (item: CoffeeItem) => void;
    isFavorite: (name: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [favorites, setFavorites] = useState<CoffeeItem[]>([]);

    const toggleFavorite = (item: CoffeeItem) => {
        const isFav = favorites.some((fav) => fav.name === item.name);
        if (isFav) {
            setFavorites(favorites.filter((fav) => fav.name !== item.name));
        } else {
            setFavorites([...favorites, item]);
        }
    };

    const isFavorite = (name: string) => {
        return favorites.some((fav) => fav.name === name);
    };

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
};
