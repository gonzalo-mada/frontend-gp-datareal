export function groupDataTipoPrograma(data: any[]): any[]{
    const groupedData = data.reduce((acc, item) => {
        const category = item.Categoria;
        const existingGroup = acc.find((group: { label: any; }) => group.label === category?.Descripcion_categoria)

        if (existingGroup) {
          existingGroup.items.push({
            label: item.Descripcion_tp,
            value: item.Cod_tipoPrograma,
            parentLabel: category.Descripcion_categoria
          });
        }else{
          acc.push({
            label: category.Descripcion_categoria,
            value: category.Cod_CategoriaTP, 
            items: [{
              label: item.Descripcion_tp,
              value: item.Cod_tipoPrograma,
              parentLabel: category.Descripcion_categoria
            }]
          })
        }
        return acc;
      }, []);
      groupedData.sort((a:any, b:any) => Number(a.value) - Number(b.value));

      return groupedData;
}

export function groupDataUnidadesAcademicas(data: any[]): any[]{
  // Crear un mapa para agrupar por facultad
  const facultadMap = new Map();

  data.forEach(item => {
    const facultadDescripcion = item.Facultad.Descripcion_facu;

    // Verificar si la facultad ya existe en el mapa
    if (!facultadMap.has(facultadDescripcion)) {
        facultadMap.set(facultadDescripcion, {
            label: facultadDescripcion,
            value: item.Facultad.Cod_facultad,
            items: []
        });
    }

    // Agregar la unidad académica al grupo correspondiente
    facultadMap.get(facultadDescripcion).items.push({
        label: item.Descripcion_ua,
        value: {
            Cod_unidad_academica: item.Cod_unidad_academica,
            Descripcion_ua: item.Descripcion_ua,
            checkDisabled: true,
            Facultad: item.Facultad
        }
    });
  });

  // Convertir el mapa en un arreglo
  return Array.from(facultadMap.values());
}

export function groupDataUnidadesAcademicasWithDisabled(data: any[]): any[]{
  const groupedData = data.reduce((acc, item) => {
      const category = item.Facultad;
      const existingGroup = acc.find((group: { label: any; }) => group.label === category?.Descripcion_facu)

      if (existingGroup) {
        existingGroup.items.push({
          label: item.Descripcion_ua,
          value: item,
          checkDisabled: item.checkDisabled
        });
      }else{
        acc.push({
          label: category.Descripcion_facu,
          value: category.Cod_facultad, 
          items: [{
            label: item.Descripcion_ua,
            value: item,
            checkDisabled: item.checkDisabled
          }]
        })
      }
      return acc;
    }, []);
    groupedData.sort((a:any, b:any) => Number(a.value) - Number(b.value));

    return groupedData;
}




