import beer_sample_1 from "./img/beer_sample_1.jpg";
import breakfast_sample_1 from "./img/breakfast_sample_1.jpg";
import sandwich_sample_1 from "./img/sandwich_sample_1.jpg";
import pasta_sample_1 from "./img/pasta_sample_1.jpg";
import logo_mega_sample from "./img/logo_mega_sample.jpg";

export type ProductSampleImage = {
  id: string;
  label: string;
  url: string;
};

export const productSampleImages: ProductSampleImage[] = [
  {
    id: "logo",
    label: "Logo MEGA Multiservicios",
    url: logo_mega_sample,
  },
  {
    id: "beer",
    label: "Cerveza",
    url: beer_sample_1,
  },
  {
    id: "breakfast",
    label: "Desayuno",
    url: breakfast_sample_1,
  },
  {
    id: "pasta",
    label: "Pasta",
    url: pasta_sample_1,
  },
  {
    id: "sandwich",
    label: "Sandwich",
    url: sandwich_sample_1,
  },
];
