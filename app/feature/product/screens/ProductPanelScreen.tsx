// import {
//   Link,
//   useActionData,
//   useFetcher,
//   useLoaderData,
// } from "react-router-dom";
// import { useMemo } from "react";
// import type { ProductLoaderData, ProductDTO } from "../product";
// import ProductForm from "../ui/ProductForm";

// import ListFilter from "../ui/ListFilter";
// import IncrementForm from "../ui/IncrementPrices";
// import { SortToggle } from "~/shared/ui/SortToggle";
// import {
//   useQuerySorting,
//   type UseQuerySortingConfig,
// } from "~/shared/hooks/useQuerySorting";
// import { useBulkSelection } from "../hooks/useBulkSelection";

// const PRODUCT_SORT_CONFIG: UseQuerySortingConfig<ProductDTO> = {
//   defaultKey: "name",
//   keys: [
//     { key: "name", getValue: (product) => product.name },
//     { key: "code", getValue: (product) => product.code },
//     { key: "price", getValue: (product) => product.price },
//     { key: "brand", getValue: (product) => product.brand?.name ?? "" },
//     { key: "category", getValue: (product) => product.category?.name ?? "" },
//     { key: "provider", getValue: (product) => product.provider?.name ?? "" },
//   ],
// };

// export function ProductPanelScreen() {
//   const { brands, categories, providers, products, editingProduct, flash } =
//     useLoaderData<ProductLoaderData>();

//   const actionData = useActionData() as
//     | { error?: string; source?: "client" | "server" }
//     | undefined;

//   const deleteFetcher = useFetcher();
//   const deleting = deleteFetcher.state !== "idle";

//   const {
//     sortedItems: sortedProducts,
//     sortBy,
//     sortDir,
//   } = useQuerySorting(products, PRODUCT_SORT_CONFIG);

//   const visibleIds = useMemo(
//     () => sortedProducts.map((p) => p.id),
//     [sortedProducts]
//   );

//   const {
//     masterRef,
//     selectedIds,
//     allVisibleSelected,
//     toggleAllVisible,
//     toggleOne,
//   } = useBulkSelection(visibleIds, editingProduct?.id ?? null);

//   return (
//     <div>
//       <h1>Productos</h1>
//       <ProductForm
//         editingProduct={editingProduct}
//         flash={flash}
//         actionData={actionData}
//         brands={brands}
//         categories={categories}
//         providers={providers}
//       />

//       <ListFilter
//         brands={brands}
//         categories={categories}
//         providers={providers}
//       />

//       <h2>Lista de productos</h2>
//       {products.length === 0 ? (
//         <p>No hay productos activos.</p>
//       ) : (
//         <>
//           <table>
//             <thead>
//               <tr>
//                 <th>
//                   <input
//                     type="checkbox"
//                     ref={masterRef}
//                     checked={allVisibleSelected}
//                     onChange={(e) => toggleAllVisible(e.currentTarget.checked)}
//                   />
//                   {" Seleccionar todo"}
//                 </th>
//                 <SortToggle
//                   currentSort={sortBy}
//                   currentDir={sortDir}
//                   name="name"
//                   label="Nombre"
//                 />
//                 <SortToggle
//                   currentSort={sortBy}
//                   currentDir={sortDir}
//                   name="code"
//                   label="Código"
//                 />
//                 <SortToggle
//                   currentSort={sortBy}
//                   currentDir={sortDir}
//                   name="price"
//                   label="Precio"
//                 />
//                 <SortToggle
//                   currentSort={sortBy}
//                   currentDir={sortDir}
//                   name="brand"
//                   label="Marca"
//                 />
//                 <SortToggle
//                   currentSort={sortBy}
//                   currentDir={sortDir}
//                   name="category"
//                   label="Categoría"
//                 />
//                 <SortToggle
//                   currentSort={sortBy}
//                   currentDir={sortDir}
//                   name="provider"
//                   label="Proveedor"
//                 />
//                 <th style={{ width: 220 }}>Acciones</th>
//               </tr>
//             </thead>
//             <tbody>
//               {sortedProducts.map((product) => (
//                 <tr
//                   key={product.id}
//                   className={
//                     editingProduct?.id === product.id
//                       ? "row row--editing"
//                       : "row"
//                   }
//                 >
//                   <td>
//                     <input
//                       type="checkbox"
//                       form="incrementForm"
//                       name="ids"
//                       value={String(product.id)}
//                       checked={selectedIds.has(product.id)}
//                       onChange={(e) =>
//                         toggleOne(product.id, e.currentTarget.checked)
//                       }
//                     />
//                   </td>
//                   <td>{product.name}</td>
//                   <td>{product.code.toString().padStart(3, "0")}</td>
//                   <td>{product.price}</td>
//                   <td>{product.brand?.name}</td>
//                   <td>{product.category?.name}</td>
//                   <td>{product.provider?.name}</td>
//                   <td className="actions">
//                     <Link to={`?id=${product.id}`}>
//                       <button type="button">Modificar</button>
//                     </Link>
//                     <deleteFetcher.Form
//                       method="post"
//                       action="."
//                       onSubmit={(e) => {
//                         if (
//                           !confirm("¿Seguro que desea eliminar esta producto?")
//                         ) {
//                           e.preventDefault();
//                         }
//                       }}
//                       style={{ display: "inline-block", marginLeft: 8 }}
//                     >
//                       <input type="hidden" name="id" value={product.id} />
//                       <input type="hidden" name="_action" value="delete" />
//                       <button type="submit" disabled={deleting}>
//                         {deleting ? "Eliminando..." : "Eliminar"}
//                       </button>
//                     </deleteFetcher.Form>

//                     {deleteFetcher.data?.error && (
//                       <div className="inline-error" role="alert">
//                         {deleteFetcher.data.error}
//                       </div>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           <div
//             style={{
//               marginTop: 12,
//               display: "flex",
//               gap: 8,
//               alignItems: "center",
//             }}
//           >
//             <IncrementForm selectedIds={selectedIds} />
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// export function ProductPanelErrorBoundary({ error }: { error: unknown }) {
//   let message = "Ocurrió un error al cargar la lista de productos.";
//   if (error instanceof Error) {
//     message = error.message;
//   }
//   return (
//     <div>
//       <h2 style={{ color: "red" }}>Error</h2>
//       <p>{message}</p>
//     </div>
//   );
// }

import {
  Link,
  useActionData,
  useFetcher,
  useNavigation,
  useLoaderData,
  useLocation,
} from "react-router-dom";
import type { ProductLoaderData } from "~/feature/product/product";
import { FlashMessages } from "~/shared/ui/FlashMessages";
import { SuccessBanner } from "~/shared/ui/SuccessBanner";
import { useCrudSuccess } from "~/shared/hooks/useCrudSuccess";
import { useReactivateFlow } from "~/shared/hooks/useReactivateFlow";
import { ReactivatePromptBanner } from "~/shared/ui/ReactivatePromptBanner";
import { CrudHeader } from "~/shared/ui/CrudHeader";
import { ProductForm } from "../ui/ProductForm";
import { ProductTable } from "../ui/ProductTable";
import ListFilter from "../ui/ProductFilter";
import { useBulkSelection } from "../hooks/useBulkSelection";

export function ProductPanelScreen() {
  const { products, editingProduct, brands, categories, providers, flash } =
    useLoaderData<ProductLoaderData>();
  const actionData = useActionData() as
    | { error?: string; source?: "client" | "server" }
    | undefined;
  const navigation = useNavigation();
  const location = useLocation();
  const fetcher = useFetcher();

  const isSubmitting = navigation.state === "submitting";
  const isEditing = !!editingProduct;
  const deleting = fetcher.state !== "idle";

  const { prompt, dismiss } = useReactivateFlow("product");
  const { message } = useCrudSuccess("product", {
    "created-success": "Cuenta creada con éxito.",
    "updated-success": "Cuenta modificada con éxito.",
    "deleted-success": "Cuenta eliminada con éxito.",
    "reactivated-success": "Cuenta reactivada con éxito.",
  });

  return (
    <div>
      <h1>Cuentas</h1>
      <CrudHeader
        isEditing={isEditing}
        entityLabel="cuenta"
        name={editingProduct?.name ?? null}
        cancelHref="/product"
      />

      <FlashMessages
        flash={{ error: flash?.error, source: flash?.source }}
        actionError={actionData}
      />

      {message && <SuccessBanner message={message} />}

      {prompt && (
        <ReactivatePromptBanner
          messageForUpdate={
            prompt.message ??
            `Se ha detectado un producto inactivo con este nombre. 
            ¿Desea reactivarla? Si reactiva la antigua cuenta, la cuenta actual se desactivará. 
            Si desea cambiar el nombre, haga clic en cancelar.`
          }
          messageForCreate={
            prompt.message ??
            `Se ha detectado una cuenta inactiva con este nombre. 
            ¿Desea reactivarla? Si desea cambiar el nombre, haga clic en cancelar.`
          }
          label="nombre"
          inactiveId={prompt.elementId}
          currentId={editingProduct?.id}
          kind={isEditing ? "update-conflict" : "create-conflict"}
          onDismiss={dismiss}
        />
      )}

      <ProductForm
        isEditing={isEditing}
        editing={editingProduct}
        brands={brands}
        categories={categories}
        providers={providers}
        isSubmitting={isSubmitting}
        formAction={isEditing ? `.${location.search}` : "."}
      />

      <ListFilter
        brands={brands}
        categories={categories}
        providers={providers}
      />

      <ProductTable
        products={products}
        editingId={editingProduct?.id ?? null}
      />

      <div
        style={{
          marginTop: 12,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      ></div>
    </div>
  );
}

export function ProductPanelErrorBoundary({ error }: { error: unknown }) {
  let message = "Ocurrió un error al cargar la lista de cuentas.";
  if (error instanceof Error) {
    message = error.message;
  }
  return (
    <div>
      <h2 style={{ color: "red" }}>Error</h2>
      <p>{message}</p>
    </div>
  );
}
