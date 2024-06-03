import Head from "next/head";
import {
  Container,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Spinner,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Button,
  useToast,
  HStack,
  TableContainer,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  useCreateProduct,
  useDeleteProduct,
  useEditProduct,
  useFetchProducts,
} from "@/features/product";

// formik -> handle forms
// yup -> validate
// react-query -> manage API calls (caching, state, dll.)

export default function Home() {
  const toast = useToast();

  const {
    data,
    isLoading: productsIsLoading,
    refetch: refetchProducts,
  } = useFetchProducts({
    onError: () => {
      toast({
        title: "Ada kesalahan terjadi",
        status: "error",
      });
    },
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      price: "",
      description: "",
      image: "",
      id: "",
    },
    onSubmit: async () => {
      const { name, description, image, id } = formik.values;
      const price = parseInt(formik.values.price) | 0;

      if (id) {
        // Melakukan PATCH /products/{id}
        editProduct({
          name,
          price,
          description,
          image,
          id,
        });

        toast({
          title: "Product edited",
          status: "success",
        });
      } else {
        // Melakukan POST /products
        createProduct({
          name,
          price,
          description,
          image,
        });

        toast({
          title: "Product added",
          status: "success",
        });
      }

      handleReset(true)
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name Produk wajib diisi").min(3, "Minimal 3 karakter").max(50, "Maksimal 50 karakter"),
      price: Yup.number().required("Harga wajib diisi").min(10000, "Minimal Rp10.000"),
      description: Yup.string().nullable(),
      image: Yup.string().required().matches(/^(https?:\/\/[^\s]+(\.png|\.jpg|\.jpeg|\.gif)(\?[^#]*)?(#.*)?)$/, "Masukkan URL gambar yang valid"),
    }),
  });

  const { mutate: createProduct, isLoading: createProductsIsLoading } =
    useCreateProduct({
      onSuccess: () => {
        refetchProducts();
      },
    });

  const { mutate: deleteProduct } = useDeleteProduct({
    onSuccess: () => {
      refetchProducts();
    },
  });

  const { mutate: editProduct, isLoading: editProductIsLoading } =
    useEditProduct({
      onSuccess: () => {
        refetchProducts();
      },
    });

  const handleFormInput = (event) => {
    formik.setFieldValue(event.target.name, event.target.value);
  };

  const confirmationDelete = (productId) => {
    const shouldDelete = confirm("Are you sure?");

    if (shouldDelete) {
      deleteProduct(productId);
      toast({
        title: "Deleted product",
        status: "info",
      });
    }
  };

  const handleReset = (closeEdit) => {
    formik.setFieldValue("name", "");
    formik.setFieldValue("price", "");
    formik.setFieldValue("description", "");
    formik.setFieldValue("image", "");
    if (closeEdit) {
      formik.setFieldValue("id", "");
    }

  }

  const onEditClick = (product) => {
    formik.setFieldValue("id", product.id);
    formik.setFieldValue("name", product.name);
    formik.setFieldValue("description", product.description);
    formik.setFieldValue("price", product.price);
    formik.setFieldValue("image", product.image);
  };

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Container my={5} maxW={"900px"}>
          <Heading textAlign={"center"}>Home Page</Heading>
          <form onSubmit={formik.handleSubmit}>
            <VStack my={5} spacing="3">
              <FormControl isInvalid={formik.errors.name && formik.touched.name}>
                <FormLabel>Nama Produk</FormLabel>
                <Input
                  placeholder="Masukan Nama Produk"
                  onChange={handleFormInput}
                  name="name"
                  value={formik.values.name}
                  _focusVisible={formik.errors.name ? {} : null}
                />
                <FormErrorMessage>{formik.errors.name}</FormErrorMessage>
              </FormControl>
              <FormControl isInvalid={formik.errors.price && formik.touched.price}>
                <FormLabel>Harga</FormLabel>
                <Input
                  placeholder="Masukan Harga Produk"
                  onChange={handleFormInput}
                  name="price"
                  value={formik.values.price}
                  _focusVisible={formik.errors.price ? {} : null}
                />
                <FormErrorMessage>{formik.errors.price}</FormErrorMessage>
              </FormControl>
              <FormControl>
                <FormLabel>Deskripsi <span style={{ color: "gray", fontSize: "12px" }}>(opsional)</span></FormLabel>
                <Input
                  placeholder="Masukan Deskripsi produk"
                  onChange={handleFormInput}
                  name="description"
                  value={formik.values.description}
                />
              </FormControl>
              <FormControl isInvalid={formik.errors.image && formik.touched.image}>
                <FormLabel>Gambar</FormLabel>
                <Input
                  placeholder="Masukan Gambar Produk"
                  onChange={handleFormInput}
                  name="image"
                  value={formik.values.image}
                  _focusVisible={formik.errors.image ? {} : null}
                />
                <FormErrorMessage>{formik.errors.image}</FormErrorMessage>
              </FormControl>
              {createProductsIsLoading || editProductIsLoading ? (
                <Spinner />
              ) : (
                <HStack>
                  <Button name="id" value={formik.values.id} type="submit" colorScheme={formik.values.id ? "blue" : "green"}>{formik.values.id ? "Edit" : "Submit"} Product</Button>
                  <Button type="reset" onClick={() => handleReset()}>Reset</Button>
                  {formik.values.id && <Button type="button" colorScheme={"red"} onClick={() => handleReset(true)}>Batal Edit</Button>}
                </HStack>
              )}
            </VStack>
          </form>
          <TableContainer my="10">
            <Table>
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Name</Th>
                  <Th>Price</Th>
                  <Th>Description</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                <RenderProducts data={data} onEditClick={onEditClick} confirmationDelete={confirmationDelete} />
                {productsIsLoading && <Tr><Td textAlign={"center"} colSpan={5}><Spinner /></Td></Tr>}
                {!data && !productsIsLoading && <Tr><Td textAlign={"center"} fontWeight={"bold"} color={"red"} colSpan={5}>No data</Td></Tr>}
              </Tbody>
            </Table>
          </TableContainer>
        </Container>
      </main>
    </>
  );
}

const RenderProducts = ({ data, onEditClick, confirmationDelete }) => {
  return data?.data.data.map((product) => {
    return (
      <Tr key={product.id}>
        <Td>{product.id}</Td>
        <Td>{product.name}</Td>
        <Td>{product.price}</Td>
        <Td>{product.description}</Td>
        <Td>
          <HStack>
            <Button size={"sm"} onClick={() => onEditClick(product)} colorScheme="blue">
              Edit
            </Button>
            <Button size={"sm"}
              onClick={() => confirmationDelete(product.id)}
              colorScheme="red"
            >
              Delete
            </Button>
          </HStack>
        </Td>
      </Tr>
    );
  });
};
