import { Button } from "src/components/ui/button";
import { Checkbox } from "src/components/ui/checkbox";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";


const AuthRegister = () => {
  return (
    <>
      <form className="mt-6">
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="name" className="font-semibold" >Nombre</Label>
          </div>
          <Input
            id="name"
            type="text"
            placeholder="Ingresa tu nombre"
          />
        </div>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="lastname" className="font-semibold" >Apellido</Label>
          </div>
          <Input
            id="name"
            type="text"
            placeholder="Ingresa el primer apellido"
          />
        </div>

        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="emadd" className="font-semibold">Correo electronico</Label>
          </div>
          <Input
            id="emadd"
            type="text"
            placeholder="Ingresa el correo electrónico"
          />
        </div>
        <div className="mb-6">
          <div className="mb-2 block">
            <Label htmlFor="userpwd" className="font-semibold">Contraseña</Label>
          </div>
          <Input
            id="userpwd"
            type="password"
            placeholder="Ingresa tu contraseña"
          />
          </div>
          <div className="flex justify-between my-5">
            <div className="flex items-center gap-2">
              <Checkbox id="accept" className="checkbox" />
              <Label htmlFor="accept" className="opacity-90 font-normal cursor-pointer">
                Acepto los términos y condiciones
              </Label>
            </div>            
          </div>

        <Button className="w-full">Empezar ahora</Button>
      </form>
    </>
  )
}

export default AuthRegister
