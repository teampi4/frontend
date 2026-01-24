import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useEffect } from "react"
import { useHeader } from "@/hooks/useHeader"
import { useLogin } from "@/hooks/useLogin"
import { useNavigate } from "react-router-dom"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"

const loginSchema = z.object({
  login: z.string(),
  senha: z.string().min(3, "A senha deve ter pelo menos 5 caracteres."),
})

type LoginValues = z.infer<typeof loginSchema>

export const Login = () => {
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: "",
      senha: "",
    },
  })
  const { login } = useLogin();
  const navigate = useNavigate();

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values);
      navigate("/dashboard/inicio");

    } catch (err) {
      console.error("Erro ao fazer login:", err);
    }
  }

   const { setHeader } = useHeader();

  useEffect(() => {
    setHeader({
      pageName: "Entrar",
      pathPage: "",
      actions: [
      ],
    }
)}, [setHeader]);


  return (
    <div className="min-h-screen px-4 py-10 flex items-center justify-center bg-gray-100">
      <div className="mx-auto w-full max-w-md rounded-xl border text-white p-6 shadow-sm backdrop-blur bg-[#2A64E8]">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Entrar</h1>
          <p className="text-sm">
            Acesse com seu login e senha para continuar.
          </p>
        </div>

        <form
            id="form-login"
            onSubmit={form.handleSubmit(onSubmit, (errors) => console.log("erros", errors))}
            className="mt-6 space-y-4"
        >
            <FieldGroup>
                <Controller
                    control={form.control}
                    name="login"
                    render={({ field, fieldState }) => (
                    <Field>
                        <FieldLabel>login</FieldLabel>
                        <Input
                            type="text"
                            placeholder="voce@exemplo.com"
                            autoComplete="login"
                            className="bg-white text-gray-900"
                            aria-invalid={fieldState.invalid}
                            {...field}
                        />
                        {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                        )}
                    </Field>
                    )}
                />

                <Controller
                    control={form.control}
                    name="senha"
                    render={({ field, fieldState }) => (
                    <Field>
                        <FieldLabel>Senha</FieldLabel>
                        <Input
                            type="password"
                            placeholder="Sua senha"
                            autoComplete="current-senha"
                            className="bg-white text-gray-900"
                            aria-invalid={fieldState.invalid}
                            {...field}
                        />
                        {fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                        )}
                    </Field>
                    )}
                />

            </FieldGroup>
            <Button type="submit" form="form-login"
                disabled={form.formState.isSubmitting}
                className="w-20 m-auto bg-white text-[#2A64E8] hover:bg-gray-200 cursor-pointer">
                Entrar
            </Button>
        </form>
      </div>
    </div>
  )
}
