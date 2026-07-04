const fs = require('fs');
let code = fs.readFileSync('src/components/AdminGISPanel.tsx', 'utf8');

code = code.replace(
`            </ResponsiveContainer>
          </div>
          </div>
        </div>
      )}`,
`            </ResponsiveContainer>
          </div>
        </div>
      )}`
);

fs.writeFileSync('src/components/AdminGISPanel.tsx', code);
