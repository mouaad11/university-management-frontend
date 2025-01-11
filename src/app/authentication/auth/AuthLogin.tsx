import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Checkbox,
  Snackbar,
  Alert,
} from "@mui/material";
import Link from "next/link";
import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";

interface loginType {
  title?: string;
  subtitle?: JSX.Element | JSX.Element[];
  subtext?: JSX.Element | JSX.Element[];
}

const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const router = useRouter();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedMessage = localStorage.getItem('registrationSuccessMessage');
    if (storedMessage) {
      setMessage(storedMessage);
      setOpenSnackbar(true);
      localStorage.removeItem('registrationSuccessMessage'); // Clear the message
    }
  }, []);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setMessage(''); // Clear the message to prevent re-rendering the Snackbar
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
    
      if (!response.ok) {
        let errorData: { message?: string } = {};
        try {
          errorData = await response.json(); // Parse JSON response
        } catch (jsonError) {
          console.error("Failed to parse error response JSON:", jsonError);
        }
    
        // Handle the error message
        if (errorData.message) {
          console.log(errorData.message);
          throw new Error(
            errorData.message === "PendingConfirmation"
              ? "Your account is pending confirmation. Please wait for admin approval."
              : errorData.message
          );
        } else {
          throw new Error("Échec de la connexion");
        }
      }
      const data = await response.json();
      localStorage.setItem("token", data.token);

      // Store additional user info if needed
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);
      localStorage.setItem("userId", data.id);
      localStorage.setItem("email", data.email);

      console.log("Login successful:", {
        token: data.token,
        role: data.role,
        username: data.username,
      });
  
      // Redirect based on role directly from the signin response
      switch (data.role) {
        case "ROLE_ADMIN":
          router.push("/admin");
          break;
        case "ROLE_STUDENT":
          router.push("/student");
          break;
        case "ROLE_PROFESSOR":
          router.push("/professor");
          break;
        default:
          router.push("/authentication/login");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inconnue s'est produite");
      }
      setOpenSnackbar(true);
    }
  };
  

  return (
    <>
       {/* Render Snackbar only if a message exists */}
      {message && (
        <Snackbar
          open={openSnackbar}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          message={message}
        />
      )}

      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <form onSubmit={handleLogin}>
        <Stack>
          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="username"
              mb="5px"
            >
              Nom d'utilisateur
            </Typography>
            <CustomTextField
              variant="outlined"
              fullWidth
              value={username}
              onChange={(e: any) => setUsername(e.target.value)}
              required
            />
          </Box>
          <Box mt="25px">
            <Typography
              variant="subtitle1"
              fontWeight={600}
              component="label"
              htmlFor="password"
              mb="5px"
            >
              Mot de passe
            </Typography>
            <CustomTextField
              type="password"
              variant="outlined"
              fullWidth
              value={password}
              onChange={(e: any) => setPassword(e.target.value)}
              required
            />
          </Box>
          <Stack
            justifyContent="space-between"
            direction="row"
            alignItems="center"
            my={2}
          >
            <FormGroup>
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Se souvenir de cet appareil"
              />
            </FormGroup>
            <Typography
              component={Link}
              href="/"
              fontWeight="500"
              sx={{
                textDecoration: "none",
                color: "primary.main",
              }}
            >
              Mot de passe oublié ?
            </Typography>
          </Stack>
        </Stack>
        <Box>
          <Button
            color="primary"
            variant="contained"
            size="large"
            fullWidth
            type="submit"
          >
            Se Connecter
          </Button>
        </Box>
      </form>

      {subtitle}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          severity={error.includes("pending confirmation") ? "info" : "error"} // Use "info" for pending confirmation message
          onClose={() => setOpenSnackbar(false)}
        >
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AuthLogin;