import { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import type { ColumnDef, SortingState } from '@tanstack/react-table';
import { ArrowUp, ArrowDown, ChevronsUpDown, Pencil, Trash2 } from 'lucide-react';
import { Badge } from 'src/components/ui/badge';
import { Button } from 'src/components/ui/button';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from 'src/components/ui/table';
import CardBox from '../../shared/CardBox';
import { UsuarioResponse } from 'src/types/usuario';

interface UsuariosTableProps {
  data: UsuarioResponse[];
  onEditar?: (usuario: UsuarioResponse) => void;
  onToggleEstado?: (usuario: UsuarioResponse) => void;
}

export const UsuariosTable = ({ data, onEditar, onToggleEstado }: UsuariosTableProps) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<UsuarioResponse, unknown>[]>(() => [
    {
      id: 'nombre',
      header: 'Nombre',
      accessorFn: (row) => `${row.primerNombre} ${row.primerApellido}`,
      cell: ({ getValue }) => {
        const nombre = String(getValue());
        return (
          <div className="flex items-center gap-2">
            <Badge className="size-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 shrink-0">
              {nombre[0]?.toUpperCase()}
            </Badge>
            <span className="font-semibold text-gray-900 dark:text-white">
              {nombre}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: 'Correo',
      cell: ({ getValue }) => (
        <span className="text-gray-600 dark:text-gray-300">
          {String(getValue())}
        </span>
      ),
    },
    {
      accessorKey: 'rol',
      header: 'Rol',
      cell: ({ getValue }) => {
        const rol = String(getValue());
        const colores: Record<string, string> = {
          ADMIN:     'bg-purple-100 text-purple-700',
          CONTADOR:  'bg-blue-100 text-blue-700',
          OPERADOR:  'bg-teal-100 text-teal-700',
        };
        return (
          <Badge className={`px-2 py-1 rounded-full text-xs font-medium ${colores[rol] ?? 'bg-gray-100 text-gray-700'}`}>
            {rol}
          </Badge>
        );
      },
    },
    {
      id: 'estado',
      header: 'Estado',
      accessorFn: (row) => row.activo ? 'Activo' : 'Inactivo',
      cell: ({ row }) => {
        const { activo, updatedAt } = row.original;
        if (activo) {
          return (
            <Badge className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
              Activo
            </Badge>
          );
        }

        const ahora = new Date();
        const desactivado = new Date(updatedAt);
        const diffHoras = Math.floor((ahora.getTime() - desactivado.getTime()) / (1000 * 60 * 60));
        const diffDias = Math.floor(diffHoras / 24);
        const tiempo = diffDias > 0
          ? `${diffDias} día(s)`
          : diffHoras > 0
            ? `${diffHoras} hora(s)`
            : 'Menos de 1 h';

        return (
          <div className="flex flex-col gap-0.5">
            <Badge className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium w-fit">
              Inactivo
            </Badge>
            <span className="text-xs text-muted-foreground">
              {desactivado.toLocaleDateString('es-VE', { day: '2-digit', month: 'short', year: 'numeric' })}
              <span className="mx-1">·</span>
              {tiempo}
            </span>
          </div>
        );
      },
    },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="lightprimary"
            className="size-8! rounded-full"
            onClick={() => onEditar?.(row.original)}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="lighterror"
            className="size-8! rounded-full"
            onClick={() => onToggleEstado?.(row.original)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ),
    },
  ], [onEditar, onToggleEstado]);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    globalFilterFn: 'includesString',
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <CardBox>
      {data.length === 0 ? (
        <p className="text-center py-8 text-gray-500">No hay usuarios registrados.</p>
      ) : (
        <>
          {/* Búsqueda */}
          <div className="p-4 pt-0 flex items-center justify-between flex-wrap gap-4">
            <h3 className="text-xl font-semibold">Usuarios</h3>
            <Input
              type="text"
              className="max-w-96 lg:min-w-96 min-w-full placeholder:text-gray-400"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Buscar por nombre, correo o rol..."
            />
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto border rounded-md border-ld">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="px-0">
                        <Button
                          className="flex items-center gap-1 px-4 bg-transparent hover:bg-transparent text-dark dark:text-white font-semibold"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{ asc: <ArrowUp className="w-4 h-4" />, desc: <ArrowDown className="w-4 h-4" /> }
                            [header.column.getIsSorted() as string] ??
                            (header.column.id !== 'acciones'
                              ? <ChevronsUpDown className="w-3 h-3" />
                              : null)}
                        </Button>
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} className="hover:bg-primary/10 transition-colors">
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="text-gray-700 dark:text-white/70">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center p-6 text-gray-500">
                      No se encontraron resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-border dark:border-white/10">
            <div className="flex gap-2">
              <Button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                variant="secondary"
              >
                Anterior
              </Button>
              <Button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Siguiente
              </Button>
            </div>

            <span className="font-medium text-base dark:text-white/90">
              Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </span>

            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap font-medium dark:text-white/90">
                Filas por página:
              </Label>
              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={(val) => table.setPageSize(Number(val))}
              >
                <SelectTrigger className="w-18">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20].map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </>
      )}
    </CardBox>
  );
};