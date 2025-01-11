"use client";
import { Grid, Box, Card, Typography, Stack, useTheme } from "@mui/material";
import Link from "next/link";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import Logo from "@/app/(DashboardLayout)/layout/shared/logo/Logo";
import AuthRegister from "../auth/AuthRegister";

const Register2 = () => {
  const theme = useTheme();

  return (
    <PageContainer title="Inscription" description="Page d'inscription">
      <Box
        sx={{
          position: "relative",
          minHeight: "100vh",
          overflow: "hidden",
          "&:before": {
            content: '""',
            background: "radial-gradient(#d2f1df, #d3d7fa, #bad8f4)",
            backgroundSize: "400% 400%",
            animation: "gradient 15s ease infinite",
            position: "absolute",
            height: "100%",
            width: "100%",
            opacity: "0.3",
            zIndex: 0,
          },
        }}
      >
        <Grid
          container
          spacing={0}
          justifyContent="center"
          alignItems="center"
          sx={{ minHeight: "100vh", position: "relative", zIndex: 1 }}
        >
          <Grid
            item
            xs={12}
            sm={10}
            md={8}
            lg={6}
            xl={4}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Card
              elevation={9}
              sx={{
                p: 4,
                width: "100%",
                maxWidth: "500px",
                borderRadius: theme.shape.borderRadius,
                boxShadow: theme.shadows[10],
                backgroundColor: "background.paper",
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={4}
              >
                <Logo />
              </Box>
              <Typography
                variant="h4"
                textAlign="center"
                fontWeight="bold"
                color="textPrimary"
                gutterBottom
              >
                Inscription
              </Typography>
              <Typography
                variant="subtitle1"
                textAlign="center"
                color="textSecondary"
                mb={4}
              >
                Gestion d'occupation des salles ENSA Berrechid
              </Typography>
              <AuthRegister
                subtext={
                  <Typography
                    variant="body2"
                    textAlign="center"
                    color="textSecondary"
                    mb={2}
                  >
                    Créez un compte pour accéder à la plateforme.
                  </Typography>
                }
                subtitle={
                  <Stack
                    direction="row"
                    justifyContent="center"
                    spacing={1}
                    mt={3}
                  >
                    <Typography
                      color="textSecondary"
                      variant="body1"
                      fontWeight="400"
                    >
                      Vous avez déjà un compte ?
                    </Typography>
                    <Typography
                      component={Link}
                      href="/authentication/login"
                      fontWeight="500"
                      sx={{
                        textDecoration: "none",
                        color: "primary.main",
                        "&:hover": {
                          textDecoration: "underline",
                        },
                      }}
                    >
                      Se Connecter
                    </Typography>
                  </Stack>
                }
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
};

export default Register2;