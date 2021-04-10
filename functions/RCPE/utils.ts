import fetch from "node-fetch"
import WAE from 'web-auto-extractor'


export interface Recipe {
    name: string;
    description: string;
    recipeIngredient: string[];
    recipeInstructions: string[];
    recipeYield: string;
    recipeCuisine: string;
    image: string;
    cookTime: string;
    prepTime: string;
    url: string;
    id?: string;
    internalURL?: string;
}

export async function extractRecipe(url: string): Promise<Recipe| null> {
    try {
        const html = await fetch(url).then(x => x.text())
        const parsed = WAE().parse(html)
        const result = search(parsed, (key, value) => {
            return key === "@type" && value === "Recipe"
        })
        let recipeElement = result[0];
        recipeElement.image = recipeElement.image.url ? recipeElement.image.url : (typeof (recipeElement.image) == "object" ? recipeElement.image[0] : recipeElement.image)
        let mainInstructions = search(parsed, (key, value) => {
            return key === "@type" && value === "HowToStep"
        }).map(x => x.text ? x.text : x);
        recipeElement.recipeInstructions = mainInstructions.length > 0 ? mainInstructions : recipeElement.recipeInstructions.map(x => x.text ? x.text : x)
        recipeElement.recipeIngredient = recipeElement.ingredients || recipeElement.recipeIngredient;
        const recipe: Recipe = {
            cookTime: recipeElement.cookTime,
            description: recipeElement.description,
            image: recipeElement.image,
            name: recipeElement.name,
            prepTime: recipeElement.prepTime,
            recipeCuisine: typeof (recipeElement.recipeCuisine) == "object" ? recipeElement.recipeCuisine[0] : recipeElement.recipeCuisine,
            recipeIngredient: recipeElement.recipeIngredient,
            recipeInstructions: recipeElement.recipeInstructions,
            recipeYield: typeof (recipeElement.recipeYield) == "object" ? recipeElement.recipeYield[0] : recipeElement.recipeYield,
            url: url
        }
        return recipe as Recipe;
    } catch (e) {
        return null;
    }
}

function search(obj, predicate) {
    let result = [];
    for (let p in obj) {
        if (typeof (obj[p]) == 'object') {
            result = result.concat(search(obj[p], predicate));
        } else if (predicate(p, obj[p]))
            result.push(
                obj
            );
    }
    return result;
}

